# GoAwayGo — Web Frontend

The web version of the GoAwayGo travel app. It is a React + TypeScript single-page app that mirrors
the Flutter app in `../app_frontend` screen by screen. Brand colours, copy, routes and API calls
match the app. The layout is responsive, from 360px phones up to desktop.

|         |                                                                                |
| ------- | ------------------------------------------------------------------------------ |
| Stack   | React 19, TypeScript (strict), Vite 8, react-router-dom 7                      |
| Styling | CSS Modules + CSS custom properties (`src/styles/tokens.css`), no UI kit       |
| Icons   | Brand PNGs from the app + Material Design icons (`@material-design-icons/svg`) |
| Quality | ESLint (typescript-eslint `strictTypeChecked`, react-hooks) + Prettier         |

## Documentation

New here? Read these in order:

| File                    | What it's for                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `README.md` (this file) | What this part does and how to run it locally                                           |
| `CONTRIBUTING.md`       | Branches, commits, PRs and checks                                                       |
| `FOUNDATIONS.md`        | Every service and tool GoAwayGo uses, what it's for, free limits, where it's configured |
| `LINKS.md`              | Every dashboard and console, a weekly checklist, and how to give a new developer access |
| `CLAUDE.md`             | Project facts and conventions (also read by Claude Code)                                |
| `RELEASING.md`          | What happens after a merge, how to release, version numbers, rollbacks                  |
| `ROADMAP.md`            | What's done and what's next                                                             |
| `docs/`                 | Details for this repo (deployment)                                                      |

`CLAUDE.md`, `FOUNDATIONS.md`, `LINKS.md`, `RELEASING.md` and `ROADMAP.md` are the same in all three repos.

## Getting started

Requires **Node 22.12+** (Node 24 LTS recommended — see `.nvmrc`). `.npmrc` sets
`engine-strict=true`, so `npm install` refuses older Node versions instead of warning.

```bash
cd web_frontend
cp .env.example .env      # then fill in the values below
npm install
npm run dev               # http://localhost:5173
```

| Script                            | What it does                                                         |
| --------------------------------- | -------------------------------------------------------------------- |
| `npm run dev`                     | Dev server with HMR                                                  |
| `npm run dev:staging-api`         | Dev server using the staging API (no local backend; signed out only) |
| `npm run build`                   | Type-check (`tsc -b`) and production build into `dist/`              |
| `npm run preview`                 | Serve the production build locally                                   |
| `npm run typecheck`               | TypeScript only                                                      |
| `npm run lint`                    | ESLint                                                               |
| `npm run format` / `format:check` | Prettier                                                             |
| `npm run check`                   | typecheck + lint + format check + build (run before every PR)        |

### Environment variables

All values are public build-time config (they end up in the JS bundle). Never put secrets here.

| Variable                | Purpose                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`     | Origin of the Spring Boot backend, no trailing slash, e.g. `http://localhost:8080`. Empty means same origin.                    |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth **web** client ID. If empty, the "Continue with Google" button is hidden. Unlike the app, the page does not crash. |

`.env.example` is pre-filled with the local backend URL and the project's (public) Web client ID.

The backend must allow CORS from the web origin, for example `http://localhost:5173` in development, and needs
`GOOGLE_CLIENT_SECRET` in its own `.env` for Google sign-in (see the backend README).

## Routes

| Route                                    | Screen                 | Notes                                                                                            |
| ---------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------ |
| `/`                                      | Splash                 | Logo bounce + wave. After ~3s goes to `/home` if the session was restored, else `/auth`          |
| `/auth`                                  | Auth                   | Google button / SIGN IN → cross-fades to the email form. SKIP enters as a guest                  |
| `/auth/register`                         | Register               | Slides in over Auth                                                                              |
| `/auth/forgot-password`                  | Forgot password        | Slides in over Auth                                                                              |
| `/home`                                  | Home tab               | Categories, place search with suggestions, recent-searches banner, ideas (new every minute)      |
| `/trips`                                 | My Trips tab           | Places saved from the ideas (sign-in needed)                                                     |
| `/wanderbook`                            | Wanderbook tab         | Your profile, My Wanderposts grid and the shared Feed; signed out: the feed and a sign-in invite |
| `/wanderbook/u/:id`, `/wanderbook/p/:id` | Profile, post          | Follow or request, block, report; post with comments, likes, edit and delete                     |
| `/wanderbook/new`, `/wanderbook/edit`    | New post, edit profile | Original photos (HEIC converted to JPEG), place tag from the photo's location                    |
| `/admin/reports`                         | Wanderbook reports     | Admins only (`users.is_admin`): remove or dismiss                                                |
| `/community-guidelines`                  | Community Guidelines   | Rules for Wanderbook posts                                                                       |
| `/profile`                               | Profile tab            | Signed out: features + Google + SIGN IN. Signed in: tile grid, sign-out icon in header           |
| `/profile/details`                       | User profile           | Account rows + Sign Out (with confirmation)                                                      |
| `/flights`                               | Book flights           | Slides in; tab bar hidden                                                                        |
| `/stays`                                 | Book hotels            | Slides in; tab bar hidden                                                                        |
| `/rentals`                               | Rent a car             | Slides in; tab bar hidden                                                                        |
| `/destination/:place`                    | Destination info       | `?id=` picked place or `?q=` text. Travel animation, then spot photos and the 9 AI cards         |

The 4-tab bar is a bottom tab bar under 768px and a sticky top bar on wider screens.

## Project structure

```
src/
  app/          App.tsx, router.tsx, layouts (Shell = tab screens, Overlay = slide-in screens), TabNav
  assets/       icons/ and images/ copied from ../app_frontend/assets
  components/   shared UI: Button, TextField, DateField, CounterField, SelectField, FieldShell,
                FieldPair (+ SwapButton), ChoiceChips, FormRow, SearchFormLayout, PageHeader,
                PageShell, Logo, MaskIcon, IconTile, FeatureList, StatusDialog, NotificationButton
  features/
    auth/ home/ flights/ stays/ rentals/ destination/ wanderbook/ profile/ trips/ splash/
      components/ pages/ hooks/ services/ data/ types.ts   (only the folders a feature needs)
  hooks/        useAsyncAction, useBack, usePrefersReducedMotion
  lib/          apiClient.ts, apiError.ts, session.ts, env.ts, routes.ts, validation.ts, date.ts, googleIdentity.ts
  providers/    UserProvider (session restore + signed-in user), DialogProvider (success/error/confirm)
  styles/       tokens.css (design tokens), global.css
  types/        User (+ wire DTO and mappers), shared search types, Google OAuth 2.0 code-client typings
```

Conventions: kebab-case or lowercase feature folders, PascalCase component files with a sibling
`*.module.css`, camelCase hooks and utils, and an `index.ts` barrel per feature exposing only its
pages. Colours, spacing, radii, sizes and durations come from `tokens.css`. Components never
hardcode a hex value or a magic size.

## Data and API layer

`src/lib/apiClient.ts` is the only place that calls `fetch` for API requests. It reads error messages in one
place (`message` → `error` → fallback, plus the machine-readable `error` code) and turns network failures into
`ApiError('Unable to connect to server.', 0)`.

| Call                   | Endpoint                                        | Success                      |
| ---------------------- | ----------------------------------------------- | ---------------------------- |
| `signUp`               | `POST /api/auth/signup` `{name,email,password}` | 201                          |
| `signIn`               | `POST /api/auth/signin` `{email,password}`      | 200 session + refresh cookie |
| `signInWithGoogleCode` | `POST /api/auth/google-signin/code` `{code}`    | 200 session + refresh cookie |
| `restoreSession`       | `POST /api/auth/refresh` (refresh cookie)       | 200 session, or 401          |
| `signOut`              | `POST /api/auth/logout` (refresh cookie)        | 204                          |
| `requestPasswordReset` | `POST /api/auth/forgot-password` `{email}`      | 2xx _(backend: next PR)_     |

Discover (4.1, `src/features/discover`): `suggestPlaces` (`GET /api/discover/places`), `getDestination`
(`GET /api/discover/destination`), `getRecentSearches` (`GET /api/discover/recent`), `getPhotosFor`
(`POST /api/discover/photos`, for searches kept on the device when signed out), `getTripIdeas`
(`GET /api/discover/ideas`), and My Trips (`/api/me/saved-places`). How the backend builds them:
`backend/docs/destination-prompts.md`.

The user travels snake_case on the wire (`UserDto`) and camelCase in the app (`User`), converted in
`src/types/user.ts`.

### Authentication (`src/lib/session.ts`)

- **Access token** (20 min): kept **in memory only** and sent as `Authorization: Bearer`. Never in
  `localStorage`, where an injected script could read it.
- **Refresh token** (30 days): an **HttpOnly, Secure, SameSite=Strict cookie** set by the backend on
  `/api/auth`. JavaScript can't read it; requests use `credentials: 'include'`.
- **Page load:** the session is restored with one `POST /api/auth/refresh`. `SessionGate` holds rendering until
  then, so every page knows from its first render whether someone is signed in. Nothing about the user is stored
  in the browser (an old `user` key from earlier versions is removed).
- **Expiry:** a 401 on an authenticated request triggers one refresh and a retry; if the refresh fails the user
  is signed out.
- **No overlapping refreshes.** The backend rotates refresh tokens and treats reuse of an old one as theft
  (it revokes the session). Concurrent callers in a tab share one request, and the Web Locks API serialises
  tabs, so a second tab refreshes with the cookie the first one just received.
- **Sign out** asks for confirmation, then revokes the session on the server (`/api/auth/logout`).

### Google sign-in

The "CONTINUE WITH GOOGLE" button is **our own `Button`** (variant `google`: same type and shape as every other
button, white with dark text and Google's four-colour G). Clicking it opens Google's popup through the
**OAuth 2.0 code client** (Google Identity Services), which returns a one-time authorization code. The code is
sent to the backend, which exchanges it with Google using the client secret, so no secret or ID token is
handled in the browser. A random `state` is sent with each request and must come back unchanged. If the browser
blocks the popup, the user is asked to allow pop-ups.

## Differences from the Flutter app (deliberate)

- **No duplicated widgets.** The app has three copies each of the input field, date-picker util
  and form-controller util (`flight_*`, `hotel_*`, `rentals_*`). It also has two copies of
  `AuthButton` and `FeatureItem`, and identical `CategoryButton` / `ProfileButton` widgets. Here
  they are a single `FieldShell`-based field family, one `Button`, one `FeatureList` and one
  `IconTile`, shared through `src/components`. The three booking screens share `SearchFormLayout`.
- **Missing config doesn't crash.** The app throws on a missing `.env`. Here, a missing API URL
  falls back to same-origin, and a missing Google client ID hides the Google button.
- **Real sessions instead of a stored user.** The app stores the user and "verifies" it by id. Here the
  session is restored from an HttpOnly refresh cookie and every request carries a short-lived token
  (see _Authentication_).
- **Forgot password only asks for the email.** A reset link will be emailed; the reply never reveals whether
  an account exists. The app's form sets a new password directly, which would let anyone take over an account.
- **User Profile shows real data or "Not set".** The app hardcodes demo values for every row.
  Email, Display Name and Phone come from the signed-in user. Country / Region and Currency show
  "Not set" because the backend has no such fields yet.
- **Sign Out works.** In the app it is an empty handler. Here it asks for confirmation, revokes the session on
  the server and returns to `/auth`. A sign-out icon also sits in the Profile header.
- **Google sign-in uses our own button** in the app's button style (authorization-code flow, see above).
- Date fields use the browser's native date picker, with a dark colour scheme, limited to
  today → +365 days. Values are `YYYY-MM-DD`.

## Stubs and placeholders (not implemented on purpose)

| What                                                    | Where                                        | Status                                                                                              |
| ------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Flight / hotel / rental search                          | `features/*/services/*Service.ts`            | `console.info`s the typed payload. The app's buttons are `// TODO` and there is no backend endpoint |
| Notifications bell                                      | —                                            | Visibly disabled ("coming soon"). Empty handlers in the app                                         |
| Profile tiles: Recently Viewed, Saved, Reviews, Rewards | `features/profile/pages/ProfilePage.tsx`     | Visibly disabled ("Coming soon"). My Trips and User Profile are wired                               |
| Password reset email                                    | `features/auth/pages/ForgotPasswordPage.tsx` | The form is final; the backend endpoint arrives with the email-provider work                        |

## Accessibility and motion

- Real `<button>` / `<a>` elements, labelled inputs (visually hidden labels where the design uses
  placeholders), and visible focus rings on everything.
- Dialogs use the native `<dialog>`: focus is trapped and Esc closes them. They also auto-dismiss
  after 3s like the app.
- Choice chips are radio inputs. Wanderbook tabs follow the WAI-ARIA tabs pattern (arrow keys).
- `prefers-reduced-motion` turns off the splash bounce, the wave, the slide-ins, the carousel
  scaling and the Wanderbook header collapse.
