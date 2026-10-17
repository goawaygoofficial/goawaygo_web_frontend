# Deployment

The website is a static build (`npm run build` → `dist/`) hosted on **Cloudflare Pages**, which builds and deploys
it from GitHub on every push. The backend's setup is in `goaway_backend/docs/deployment.md`.

| Environment | Branch    | Pages project      | Address                | API                        |
| ----------- | --------- | ------------------ | ---------------------- | -------------------------- |
| Staging     | `develop` | `goawaygo-staging` | `staging.goawaygo.com` | `https://api.goawaygo.com` |
| Production  | `main`    | `goawaygo` (later) | `goawaygo.com`         | decided at launch          |

The website and API must stay on the same registrable domain (`goawaygo.com`): the login refresh cookie is
`SameSite=Strict`.

## How it works

- Cloudflare's GitHub app watches this repository. A push to `develop` builds and deploys staging; every PR also
  gets its own preview address (`<hash>.goawaygo-staging.pages.dev`).
- Pages serves `index.html` for any unknown path (there is no `404.html`), so React Router handles deep links such
  as `/reset-password?token=…`.
- [`public/_headers`](../public/_headers) adds security headers and long-term caching for hashed assets.
- Node version comes from `.nvmrc`.
- `VITE_*` settings are baked in at build time. They are public values (the API address and the Google client
  ID): never put a secret in a `VITE_` variable.

## One-time setup (staging)

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**. Authorise the Cloudflare GitHub
   app for the `goawayofficial` account, **only for the `goaway_web_frontend` repository**.
2. Project name `goawaygo-staging`, production branch **`develop`**.
3. Build settings: framework preset **None**, build command `npm run build`, output directory `dist`.
4. Environment variables (Production):
   - `VITE_API_BASE_URL` = `https://api.goawaygo.com`
   - `VITE_GOOGLE_CLIENT_ID` = the Web client ID (same value as in `.env.example`)
5. **Save and Deploy**. Then **Custom domains → Set up a custom domain** → `staging.goawaygo.com` (Cloudflare adds
   the DNS record itself).
6. Google sign-in: Google Cloud project `goaway-483709` → Google Auth Platform → Clients → **Goaway Web** → add
   `https://staging.goawaygo.com` to **Authorised JavaScript origins**.
7. Preview deployments (PRs) can't sign in with Google or reach the API (different origin); test those flows on
   staging after merge.

## Rollback

Workers & Pages → `goawaygo-staging` → Deployments → pick an earlier deployment → **Rollback to this deployment**.
