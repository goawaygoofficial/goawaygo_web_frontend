# Deployment

The website is a static build (`npm run build` → `dist/`) hosted on **Cloudflare Pages**, one project per
environment, uploaded by GitHub Actions (Direct Upload: Cloudflare doesn't build anything). The backend's setup is in
`goawaygo_backend/docs/deployment.md`; how a version moves up is in `RELEASING.md`.

| Environment | Gets                                    | Pages project       | Address                        | API                             |
| ----------- | --------------------------------------- | ------------------- | ------------------------------ | ------------------------------- |
| dev         | every version (Release)                 | `goawaygo-web-dev`  | `dev.goawaygo.com`             | `https://api-dev.goawaygo.com`  |
| test        | a version from dev (Controller, owner)  | `goawaygo-web-test` | `test.goawaygo.com`            | `https://api-test.goawaygo.com` |
| prod        | a version from test (Controller, owner) | `goawaygo-web-prod` | `goawaygo.com` (+ `www` → 301) | `https://api.goawaygo.com`      |

These three are the only website addresses (`www.goawaygo.com` is a Redirect Rule to `goawaygo.com`). The pre-launch
`staging.goawaygo.com` was deleted on 14 Nov 2026.

The website and API must stay on the same registrable domain (`goawaygo.com`): the login refresh cookie is
`SameSite=Strict`.

## How it works

- **One build for every environment.** Release (`release.yml`) builds each version once and attaches the zip to its
  GitHub Release; `deploy.yml` uploads that same zip to the environment's Pages project. The API address and the
  environment's name come from the address the site is served at (`src/lib/env.ts`), so nothing is baked in per
  environment.
- **prod only:** the deploy also pre-renders the 50 destination pages from prod's data
  (`scripts/prerender-destinations.mjs`, about 50 minutes) and uploads again with them and the full sitemap.
- Pages serves `index.html` for any unknown path (there is no `404.html`), so React Router handles deep links such
  as `/reset-password?token=…`.
- [`public/_headers`](../public/_headers) adds security headers, long-term caching for hashed assets and
  `X-Robots-Tag: noindex` everywhere except `goawaygo.com`.
- Node version comes from `.nvmrc`.

## GitHub settings

- Repository secret `CLOUDFLARE_API_TOKEN` (Cloudflare token "GitHub Pages deploy": Account → Cloudflare Pages →
  Edit, nothing else) and variable `CLOUDFLARE_ACCOUNT_ID`.
- Environments `dev`, `test`, `prod`, each with `PAGES_PROJECT` and `WEB_URL` (the table above). test and prod need
  the owner's approval.
- Repository variable `PROD_WEB_URL` = `https://goawaygo.com` (the prod smoke tests).

## Setting up an environment (once)

1. Cloudflare → **Workers & Pages → Create → Pages → Upload assets** (Direct Upload), project name from the table.
   Upload anything once (the first deploy replaces it).
2. **Custom domains → Set up a custom domain** → the address from the table (Cloudflare adds the DNS record).
3. Google sign-in: Google Cloud project `goaway-483709` → Google Auth Platform → Clients → **Goaway Web** → add the
   address to **Authorised JavaScript origins**.
4. The GitHub environment with `PAGES_PROJECT` and `WEB_URL`; the backend's `CORS_ALLOWED_ORIGINS` for that
   environment includes the address.

## Rollback

Actions → **Controller** → Run workflow on `main` (prod) or `test`, with an earlier version that passed there
(`RELEASING.md`). In an emergency: Workers & Pages → the environment's project → Deployments → an earlier deployment →
**Rollback to this deployment**.
