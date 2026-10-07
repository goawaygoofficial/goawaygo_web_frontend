# Goaway — Web Frontend

The web version of the Goaway travel app. It is a React + TypeScript single-page app that mirrors
the Flutter app in `../app_frontend` screen by screen. Brand colours, copy, routes and API calls
match the app. The layout is responsive, from 360px phones up to desktop.

|         |                                                                          |
| ------- | ------------------------------------------------------------------------ |
| Stack   | React 19, TypeScript (strict), Vite 8, react-router-dom 7                |
| Styling | CSS Modules + CSS custom properties (`src/styles/tokens.css`), no UI kit |
| Icons   | Brand PNGs from the app + `lucide-react` for UI glyphs                   |
| Quality | ESLint (typescript-eslint `strictTypeChecked`, react-hooks) + Prettier   |

## Getting started

Requires **Node 22.12+** (Node 24 LTS recommended — see `.nvmrc`). `.npmrc` sets
`engine-strict=true`, so `npm install` refuses older Node versions instead of warning.

```bash
cd web_frontend
cp .env.example .env      # then fill in the values below
npm install
npm run dev               # http://localhost:5173
```

| Script                            | What it does                                                  |
| --------------------------------- | ------------------------------------------------------------- |
| `npm run dev`                     | Dev server with HMR                                           |
| `npm run build`                   | Type-check (`tsc -b`) and production build into `dist/`       |
| `npm run preview`                 | Serve the production build locally                            |
| `npm run typecheck`               | TypeScript only                                               |
| `npm run lint`                    | ESLint                                                        |
| `npm run format` / `format:check` | Prettier                                                      |
| `npm run check`                   | typecheck + lint + format check + build (run before every PR) |

### Environment variables

All values are public build-time config (they end up in the JS bundle). Never put secrets here.

| Variable                | Purpose                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`     | Origin of the Spring Boot backend, no trailing slash, e.g. `http://localhost:8080`. Empty means same origin.                    |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth **web** client ID. If empty, the "Continue with Google" button is hidden. Unlike the app, the page does not crash. |

The backend must allow CORS from the web origin, for example `http://localhost:5173` in development.

## Routes

| Route                   | Screen           | Notes                                                                                 |
| ----------------------- | ---------------- | ------------------------------------------------------------------------------------- |
| `/`                     | Splash           | Logo bounce + wave. After ~3s goes to `/home` if a stored user is valid, else `/auth` |
| `/auth`                 | Auth             | Google button / SIGN IN → cross-fades to the email form. SKIP enters as a guest       |
| `/auth/register`        | Register         | Slides in over Auth                                                                   |
| `/auth/forgot-password` | Forgot password  | Slides in over Auth                                                                   |
| `/home`                 | Home tab         | Categories, destination search, trip-idea carousel                                    |
| `/trips`                | My Trips tab     | Empty state (the app's tab is a placeholder)                                          |
| `/wanderbook`           | Wanderbook tab   | Sticky search, collapsing profile header, sticky tabs, post grid                      |
| `/profile`              | Profile tab      | Signed out: features + SIGN IN. Signed in: tile grid                                  |
| `/profile/details`      | User profile     | Account rows + Sign Out                                                               |
| `/flights`              | Book flights     | Slides in; tab bar hidden                                                             |
| `/stays`                | Book hotels      | Slides in; tab bar hidden                                                             |
| `/rentals`              | Rent a car       | Slides in; tab bar hidden                                                             |
| `/destination/:place`   | Destination info | Opened from Home search or a carousel card                                            |

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
  lib/          apiClient.ts, env.ts, routes.ts, validation.ts, date.ts, googleIdentity.ts
  providers/    UserProvider (mirrors the Flutter UserProvider), DialogProvider
  styles/       tokens.css (design tokens), global.css
  types/        User (+ wire DTO and mappers), shared search types, Google Identity typings
```

Conventions: kebab-case or lowercase feature folders, PascalCase component files with a sibling
`*.module.css`, camelCase hooks and utils, and an `index.ts` barrel per feature exposing only its
pages. Colours, spacing, radii, sizes and durations come from `tokens.css`. Components never
hardcode a hex value or a magic size.

## Data and API layer

`src/lib/apiClient.ts` is the only place that calls `fetch`. It reads error messages in one place
(`message` → `error` → fallback) and turns network failures into
`ApiError('Unable to connect to server.', 0)`. The endpoints are the same ones the app uses:

| Call               | Endpoint                                               | Success                |
| ------------------ | ------------------------------------------------------ | ---------------------- |
| `signUp`           | `POST /api/auth/signup` `{name,email,password}`        | 201                    |
| `signIn`           | `POST /api/auth/signin` `{email,password}`             | 200 `{user, token}`    |
| `signInWithGoogle` | `POST /api/auth/google-signin` `{idToken}`             | 200 `{user, token}`    |
| `resetPassword`    | `POST /api/auth/forgot-password` `{email,newPassword}` | 200                    |
| `verifyUser`       | `GET /api/auth/users/{id}`                             | 200 with matching `id` |

The user travels snake_case on the wire (`UserDto`) and camelCase in the app (`User`). It is
converted with explicit mappers in `src/types/user.ts`. It is stored in `localStorage` under the
key `user`, the same key as the app's SharedPreferences, in the same JSON shape. On boot the
stored user is re-validated with `GET /api/auth/users/{id}`.

## Differences from the Flutter app (deliberate)

- **No duplicated widgets.** The app has three copies each of the input field, date-picker util
  and form-controller util (`flight_*`, `hotel_*`, `rentals_*`). It also has two copies of
  `AuthButton` and `FeatureItem`, and identical `CategoryButton` / `ProfileButton` widgets. Here
  they are a single `FieldShell`-based field family, one `Button`, one `FeatureList` and one
  `IconTile`, shared through `src/components`. The three booking screens share `SearchFormLayout`.
- **Missing config doesn't crash.** The app throws on a missing `.env`. Here, a missing API URL
  falls back to same-origin, and a missing Google client ID hides the Google button.
- **Restored-user validation is more forgiving.** The app signs the user out on _any_ failed check,
  including no network. Here the stored user is cleared only when the backend answers 4xx or the
  ids don't match. A network error or 5xx keeps the user signed in.
- **Forgot password validates the new password** with the same rule as Register.
- **User Profile shows real data or "Not set".** The app hardcodes demo values for every row.
  Email, Display Name and Phone come from the signed-in user. Country / Region and Currency show
  "Not set" because the backend has no such fields yet.
- **Sign Out works.** In the app it is an empty handler. Here it clears the stored user and
  returns to `/auth`.
- **Google sign-in uses Google's own rendered button** (pill, outline theme), which Google
  Identity Services requires. The app's custom orange-on-white button cannot be reproduced with
  GIS.
- Date fields use the browser's native date picker, with a dark colour scheme, limited to
  today → +365 days. Values are `YYYY-MM-DD`.

## Stubs and placeholders (not implemented on purpose)

| What                                                    | Where                                        | Status                                                                                              |
| ------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Flight / hotel / rental search                          | `features/*/services/*Service.ts`            | `console.info`s the typed payload. The app's buttons are `// TODO` and there is no backend endpoint |
| Trip ideas carousel                                     | `features/home/data/tripIdeas.ts`            | Placeholder `TripIdea[]`. The app shows blank coloured cards                                        |
| Wanderbook profile + posts                              | `features/wanderbook/data/mockWanderbook.ts` | Mock data, labelled as sample posts in the UI. The signed-in user's name replaces the demo name     |
| My Trips                                                | `features/trips`                             | Honest empty state. The app's tab is a placeholder text                                             |
| Notifications bell, Wanderbook camera / edit buttons    | —                                            | Visibly disabled ("coming soon"). Empty handlers in the app                                         |
| Profile tiles: Recently Viewed, Saved, Reviews, Rewards | `features/profile/pages/ProfilePage.tsx`     | Visibly disabled ("Coming soon"). My Trips and User Profile are wired                               |
| Auth token                                              | `features/auth/services/authService.ts`      | Returned by the service but not stored. The app discards it too, and no endpoint needs it yet       |

## Accessibility and motion

- Real `<button>` / `<a>` elements, labelled inputs (visually hidden labels where the design uses
  placeholders), and visible focus rings on everything.
- Dialogs use the native `<dialog>`: focus is trapped and Esc closes them. They also auto-dismiss
  after 3s like the app.
- Choice chips are radio inputs. Wanderbook tabs follow the WAI-ARIA tabs pattern (arrow keys).
- `prefers-reduced-motion` turns off the splash bounce, the wave, the slide-ins, the carousel
  scaling and the Wanderbook header collapse.
