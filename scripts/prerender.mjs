// Pre-renders the public pages after `vite build` (MVP 2, 5.7), so search engines and partners that don't run
// JavaScript still read real content: each page is opened in Chromium and its finished HTML (with its own title,
// description and canonical address, src/lib/pageMeta.ts) is saved as dist/<page>.html, which Cloudflare Pages serves
// for /<page>. In the browser the app then starts as usual and takes over the page.
//
// Also writes dist/sitemap.xml and dist/robots.txt. API calls are blocked while rendering: the pages' static parts
// are what is captured, and a build never depends on a backend.
//
// Usage: node scripts/prerender.mjs        (after `npm run build`; needs `npx playwright install chromium`)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

import { chromium } from 'playwright';

const DIST = path.resolve('dist');
const SITE = 'https://goawaygo.com';

/** The public pages, each with how often it changes (for the sitemap). */
export const PAGES = [
  ['/home', 'daily'],
  ['/flights', 'weekly'],
  ['/stays', 'weekly'],
  ['/rentals', 'weekly'],
  ['/download', 'weekly'],
  ['/privacy', 'monthly'],
  ['/terms', 'monthly'],
  ['/delete-my-data', 'monthly'],
  ['/community-guidelines', 'monthly'],
];

/** Signed-in or personal pages: never indexed. */
const PRIVATE = [
  '/profile',
  '/trips',
  '/plans/',
  '/notifications',
  '/admin/',
  '/wanderbook/new',
  '/wanderbook/edit',
  '/wanderbook/requests',
  '/wanderbook/blocked',
  '/reset-password',
  '/verify-email',
  '/confirm-email',
];

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
};

/** dist/ like Cloudflare Pages serves it: a file if there is one, else the app (index.html). */
function serve(shell) {
  return http.createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const file = path.join(DIST, decodeURIComponent(url.pathname));
    if (file.startsWith(DIST) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      response.writeHead(200, {
        'Content-Type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      });
      fs.createReadStream(file).pipe(response);
      return;
    }
    response.writeHead(200, { 'Content-Type': TYPES['.html'] });
    response.end(shell);
  });
}

/**
 * Renders `pages` (paths) with the app shell and saves each as dist/<path>.html.
 * @param {(page: import('playwright').Page) => Promise<void>} [prepare] e.g. to route API calls
 */
export async function render(pages, { prepare, timeout = 30_000 } = {}) {
  const shell = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
  const server = serve(shell);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch();
  const done = [];
  try {
    const context = await browser.newContext({ locale: 'en-GB' });
    // A visitor who answered the analytics question and reads English: no banner in the captured HTML.
    await context.addInitScript(() => {
      window.localStorage.setItem('goawaygo.analyticsConsent', 'denied');
      window.localStorage.setItem('goawaygo.language', 'en');
    });
    for (const pagePath of pages) {
      const page = await context.newPage();
      if (prepare) {
        await prepare(page);
      } else {
        await page.route(
          (url) => url.pathname.startsWith('/api/'),
          (route) => route.abort(),
        );
      }
      await page.goto(base + pagePath, { waitUntil: 'networkidle', timeout });
      // pageMeta.ts has run once the title carries the site name after the page's own title.
      await page.waitForFunction(() => document.title.includes(' · '), null, { timeout });
      const html = (await page.content()).replaceAll(base, '');
      const target = path.join(DIST, `${pagePath.replace(/^\/+/, '')}.html`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, html);
      done.push(pagePath);
      console.log(
        `rendered ${pagePath} (${Math.round(html.length / 1024)} KB): ${await page.title()}`,
      );
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  return done;
}

/** sitemap.xml and robots.txt for goawaygo.com (other hosts send `X-Robots-Tag: noindex`, public/_headers). */
export function writeSitemap(extra = []) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = [...PAGES, ...extra].map(
    ([pagePath, changefreq]) =>
      `  <url><loc>${SITE}${encodeURI(pagePath)}</loc><lastmod>${today}</lastmod><changefreq>${changefreq}</changefreq></url>`,
  );
  fs.writeFileSync(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`,
  );
  const robots = [
    'User-agent: *',
    'Allow: /',
    ...PRIVATE.map((p) => `Disallow: ${p}`),
    '',
    `Sitemap: ${SITE}/sitemap.xml`,
  ];
  fs.writeFileSync(path.join(DIST, 'robots.txt'), `${robots.join('\n')}\n`);
  console.log(`sitemap.xml: ${entries.length} pages; robots.txt`);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('prerender.mjs')) {
  await render(PAGES.map(([pagePath]) => pagePath));
  writeSitemap();
}
