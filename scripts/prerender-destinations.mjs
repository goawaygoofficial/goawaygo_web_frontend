// Pre-renders the destination pages of 50 popular places (scripts/destinations.json) into dist/ (MVP 2, 5.7), with
// their real AI travel cards, so search engines and partners can read GoAwayGo's travel content. Runs only in the prod
// deploy (deploy.yml), after the build is live: the pages' data comes from that environment's API (API_URL), the same
// answers a visitor gets. The sitemap is rewritten to include the pages that rendered.
//
// The API allows 10 destination pages per 10 minutes from one address, so the pages are opened one a minute (about
// 50 minutes). Each uses one AI answer: ~50 per prod deploy, within the free daily quota. A page whose AI answer
// isn't ready in time is left out (and out of the sitemap) until the next deploy.
//
// Usage: API_URL=https://api.goawaygo.com node scripts/prerender-destinations.mjs   (dist/ = the deployed build)
import fs from 'node:fs';

import { render, writeSitemap } from './prerender.mjs';

const API_URL = (process.env.API_URL ?? '').replace(/\/+$/, '');
if (!API_URL) {
  console.error('API_URL is required (the API whose data the pages show)');
  process.exit(1);
}
const PAUSE_MS = Number(process.env.PAUSE_MS ?? 61_000);
const TEST_TOKEN = (process.env.TEST_FAKES_TOKEN ?? '').trim();
const places = JSON.parse(fs.readFileSync(new URL('./destinations.json', import.meta.url), 'utf8'));

// The app's own address for a destination (routes.destination): the name in the path, the search in ?q=.
const paths = places.map(
  ({ name, query }) => `/destination/${encodeURIComponent(name)}?q=${encodeURIComponent(query)}`,
);

// A server-side fetch: without the local page's Origin and Referer (the API's CORS check is for browsers).
function proxyHeaders(headers) {
  const rest = { ...headers };
  delete rest.origin;
  delete rest.referer;
  // Local tests against dev or test only: their fake outside services (prod never gets a token).
  return TEST_TOKEN ? { ...rest, 'X-GoAwayGo-Test': TEST_TOKEN } : rest;
}

const rendered = await render(paths, {
  pauseMs: PAUSE_MS,
  skipFailures: true,
  timeout: 120_000,
  // Destination pages keep loading spot photos from other sites: wait for the cards instead of a quiet network.
  waitUntil: 'load',
  // The page asks our API (same address as the site here); answer it from API_URL.
  prepare: async (page) => {
    await page.route(
      (url) => url.pathname.startsWith('/api/'),
      async (route) => {
        const url = new URL(route.request().url());
        try {
          const response = await route.fetch({
            url: `${API_URL}${url.pathname}${url.search}`,
            headers: proxyHeaders(route.request().headers()),
            // AI cards can take a while (the lite models answer when the day's best-model quota is used up).
            timeout: 120_000,
          });
          await route.fulfill({ response });
        } catch (error) {
          // A slow or failed answer fails this page only (it is skipped), never the whole run.
          console.log(`  API call for ${url.pathname} failed: ${String(error).split('\n')[0]}`);
          await route.abort().catch(() => {});
        }
      },
    );
  },
  // Ready when the cards are there ("Plan a trip here" appears with them); a failed or unknown place has none.
  ready: async (page) => {
    await page
      .getByText('Plan a trip here')
      .first()
      .waitFor({ state: 'visible', timeout: 120_000 });
  },
});

writeSitemap(rendered.map((p) => [p, 'weekly']));
console.log(`${rendered.length} of ${paths.length} destination pages rendered`);
