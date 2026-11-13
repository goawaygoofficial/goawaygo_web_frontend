# GoAwayGo Website — releases

Every merge into `develop` whose CI passes becomes a version (Release workflow) and goes to **dev**; a version
moves to **test** and **prod** only through the Controller, after it passed below and with the owner's
approval. Newest first. Each entry: the changes (pull requests) and where it ran. Update this file in the PR
that records a release reaching prod (README → Releasing).

## v1.11.7 — 2026-11-13

Ran in: dev ✅ 2026-11-13

- CLEANUP.md: accounts done ([#82](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/82))

## v1.11.6 — 2026-11-13

Ran in: dev ✅ 2026-11-13

- Clean-up record: only dev, test and prod remain ([#81](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/81))

## v1.11.5 — 2026-11-13

Ran in: dev ✅ 2026-11-13

- Clean-up: remove the staging site ([#80](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/80))

## v1.11.4 — 2026-11-13

Ran in: dev ✅ 2026-11-13

- LAUNCH.md: part B done (goawaygo.com is live) ([#79](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/79))

## v1.11.3 — 2026-11-13

Ran in: dev ✅ 2026-11-13

- LAUNCH.md: part A done ([#78](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/78))

## v1.11.2 — 2026-11-13

Ran in: dev ✅ 2026-11-13 · test ✅ 2026-11-13 · prod ✅ 2026-11-13

- fix: a slow destination page never fails the prod deploy ([#75](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/75))

## v1.11.1 — 2026-11-13

Ran in: dev ✅ 2026-11-13 · test ✅ 2026-11-13 · prod ❌ 2026-11-13

- docs: launch checklist for goawaygo.com ([#72](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/72))

## v1.11.0 — 2026-11-13

Ran in: dev ✅ 2026-11-13

- feat: pre-render 50 destination pages on each prod deploy ([#71](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/71))

## v1.10.0 — 2026-11-13

Ran in: dev ✅ 2026-11-13

- feat: public pages readable by search engines and partners ([#70](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/70))

## v1.9.2 — 2026-11-12

Ran in: dev ✅ 2026-11-12

- docs: 5.5 and 5.6 done ([#69](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/69))

## v1.9.1 — 2026-11-12

Ran in: dev ✅ 2026-11-12 · test ✅ 2026-11-12 · prod ✅ 2026-11-12

- fix: no secrets in test reports; Chrome starts in CI ([#66](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/66))

## v1.9.0 — 2026-11-12

Ran in: dev ✅ 2026-11-12

- feat: automated and performance tests after every deployment, required to move a version up ([#65](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/65))

## v1.8.1 — 2026-11-12

Ran in: dev ✅ 2026-11-12

- docs: production runs in goawaygo-prod; 5.4 done ([#64](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/64))

## v1.8.0 — 2026-11-11

Ran in: dev ✅ 2026-11-11 · test ✅ 2026-11-11 · prod ✅ 2026-11-12

- feat: controller.yaml moves a version to test and prod ([#61](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/61))

## v1.7.0 — 2026-11-11

- feat: dev, test and prod environments ([#60](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/60))

## v1.6.0 — 2026-11-11

- feat: a version and GitHub Release for every merge into develop ([#59](https://github.com/goawaygoofficial/goawaygo_web_frontend/pull/59))

## Before versioned releases (MVP 1, up to v1.5.0)

Versions started with MVP 2 (v1.6.0, Release workflow). What shipped before, all three parts together:

- **Phase 1 — Foundation:** repos, branching, CI, secret scanning, Dependabot.
- **Phase 2 — Backend and login:** PostgreSQL, JWT + rotating refresh tokens, Google Sign-In, rate limits, email
  verification and password reset, website and app connected, UI matched across web and app.
- **Phase 3 — First hosted version:** API on Cloud Run + Neon, the website on Cloudflare Pages, Resend email, Android
  builds for download and Firebase beta (app 1.0.0 build 4).
- **Phase 4 — Features:** 4.0 foundations (monitoring, analytics with consent, legal pages, the outside-API toolkit),
  4.1 Discover, 4.2 Wanderbook, 4.3 Book, 4.4 AI trip planner, 4.5 notifications, 4.6 Me, 4.7 global readiness
  (7 languages, currencies, accessibility). Details per feature: README → Roadmap.
