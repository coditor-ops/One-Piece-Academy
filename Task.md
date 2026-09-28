# Task Plan — Grand Line Skill Exchange (PS-05)

Companion docs: `PRD.md` (what), `architecture.md` (how), `rules.md` (constraints).
Use this file as the build checklist. Tick boxes as you go.

## How to read this file

- **ID:** `T-<phase>.<number>` so tasks can be referenced in commits (`feat: T-2.3 escrow on request`).
- **Size:** S (under 1h), M (1–3h), L (3–6h). Rough guides, not promises.
- **Owner roles** (rename to your teammates' names):
  - **BE** — backend, wallet and pricing logic
  - **FE** — frontend screens and data wiring
  - **UI** — theme, visuals, seed data, copy
  - **QA** — tests, demo script, docs, deployment
  - A team with fewer people can merge roles; keep BE tasks with one person to avoid wallet bugs.
- **PRD ref:** F1–F12 are the requirement features from `PRD.md`.
- **Priority:** P0 = required for the demo, P1 = should have, P2 = stretch.
- **Depends on:** tasks that must be done first.

---

## Phase 0 — Setup (do together, first)

- [ ] **T-0.1** (S, All, P0) Create repo, branches (`main`, feature branches), `.gitignore`, `.env.example`. *Done when:* everyone can clone and run.
- [ ] **T-0.2** (S, BE, P0) Init `server/` (Express, Prisma, Zod, bcrypt, JWT, node-cron), health route `GET /api/v1/health`.
- [ ] **T-0.3** (S, FE, P0) Init `client/` (Vite, React, Tailwind, React Router, React Query, Recharts).
- [ ] **T-0.4** (S, BE, P0) Provision PostgreSQL (local or hosted) and set `DATABASE_URL`.
- [ ] **T-0.5** (S, All, P0) Add Prettier + ESLint, and put `PRD.md`, `architecture.md`, `rules.md`, `Task.md` in `docs/`.
- [ ] **T-0.6** (S, BE, P0) Create central `config` module: starting grant 500, tax 5%, expiry 48h, auto-confirm 24h, pricing defaults (`k`, alpha, min/max multiplier, window), base price band. *Depends on:* T-0.2.

**Exit check:** frontend loads, calls the health endpoint, and both sides run with one command each.

---

## Phase 1 — Foundation: data, auth, profiles, listings (F1, F2, F5)

### Backend
- [ ] **T-1.1** (M, BE, P0) Write `schema.prisma` for all tables in `architecture.md` section 5; add indexes and the `balance >= 0` CHECK via migration. *Depends on:* T-0.4.
- [ ] **T-1.2** (S, BE, P0) Run first migration; confirm constraints in the database.
- [ ] **T-1.3** (M, BE, P0) Wallet module skeleton: `grant`, `hold`, `release`, `refund`, `burn`, all transactional and writing ledger rows. *Depends on:* T-1.1.
- [ ] **T-1.4** (M, BE, P0) Auth: register (with 500 VCT `GRANT`), login, JWT middleware, `GET /users/me`. *Depends on:* T-1.3.
- [ ] **T-1.5** (S, BE, P0) Profile endpoints: `GET/PUT /users/:id` (bio, avatar, crew, skills wanted). **F1**
- [ ] **T-1.6** (S, BE, P0) Skills endpoints: `GET /skills`, `GET /skills/:id`. **F2**
- [ ] **T-1.7** (M, BE, P0) Listings: create, update, deactivate, add slots; enforce base price band and one active listing per skill. **F2, F5**
- [ ] **T-1.8** (S, BE, P0) Global error handler and Zod validation middleware using the standard error shape from `rules.md`.

### Frontend
- [ ] **T-1.9** (M, FE, P0) API client + auth context + protected routes + login/register pages. *Depends on:* T-1.4.
- [ ] **T-1.10** (M, FE, P0) Profile page (view and edit). **F1**
- [ ] **T-1.11** (M, FE, P0) "Create listing" form with slot picker and base price input. **F5**

### UI / seed
- [ ] **T-1.12** (M, UI, P0) Design tokens in Tailwind (parchment, ocean, gold, crimson), fonts, base layout shell, Vivre Card icon.
- [ ] **T-1.13** (M, UI, P0) Seed script v1: skills and categories (Haki, Santoryu, Fish-Man Karate, Navigation, Black Leg Cooking, etc.), 10+ users, listings including Rayleigh, slots. *Depends on:* T-1.1.

**Exit check:** register, log in, see 500 VCT, create a listing with slots, see seeded skills.

---

## Phase 2 — Core loop: browse, request, accept, complete, pay, rate (F3, F4, F6–F10)

### Backend
- [ ] **T-2.1** (M, BE, P0) Listings search and filter: `q`, `category`, `minRating`, price range, `demand`, `sort`, pagination. **F3**
- [ ] **T-2.2** (S, BE, P0) Skill detail returns provider list with rating, sessions completed, price, next slot. **F4**
- [ ] **T-2.3** (L, BE, P0) `POST /requests`: lock slot, read current price, escrow hold, create `PENDING` request with `locked_price`, insert demand event; all in one transaction. **F6**  *Depends on:* T-1.3, T-1.7.
- [ ] **T-2.4** (M, BE, P0) Accept, reject and cancel endpoints with guarded status transitions and refunds. **F7**
- [ ] **T-2.5** (M, BE, P0) Sessions: complete, learner confirm, dispute flag; on confirm run `release` (95% provider, 5% burn) exactly once. **F8, F9**
- [ ] **T-2.6** (M, BE, P0) Ratings: one per session, learner only, recompute provider and listing averages and tier. **F10**
- [ ] **T-2.7** (S, BE, P0) Wallet endpoints: `GET /wallet`, `GET /wallet/transactions` (paginated). **F9**
- [ ] **T-2.8** (M, BE, P0) Jobs: request expiry (48h, refund) and auto-confirm (24h). Idempotent.
- [ ] **T-2.9** (M, BE, P1) Requests list endpoints for both roles (`GET /requests?role=`).

### Frontend
- [ ] **T-2.10** (L, FE, P0) Market home: skill card grid, search bar, filter panel, sort. **F3**
- [ ] **T-2.11** (M, FE, P0) Skill detail page with provider list. **F4**
- [ ] **T-2.12** (M, FE, P0) Request modal ("Send Vivre Card") with price confirmation, balance check and in-flight disabling. **F6**
- [ ] **T-2.13** (M, FE, P0) Requests inbox: Sent and Received tabs, accept and reject actions. **F7**
- [ ] **T-2.14** (M, FE, P0) My Sessions: upcoming and completed, mark done, confirm, rate stars. **F8, F10**
- [ ] **T-2.15** (M, FE, P0) Treasure Chest: balance, escrow held, ledger table. **F9**
- [ ] **T-2.16** (S, FE, P1) Provider profile page with listings and reviews. **F4**

### QA
- [ ] **T-2.17** (M, QA, P0) Wallet tests: hold, release, refund, insufficient funds, repeated release, concurrent requests on one slot.
- [ ] **T-2.18** (M, QA, P0) Request state-machine tests (all allowed and blocked transitions).
- [ ] **T-2.19** (M, QA, P0) End-to-end API test: register → list → request → accept → complete → rate, then check the conservation invariant.

**Exit check:** two accounts can complete a full paid session and rating, and the ledger reconciles.

---

## Phase 3 — Economy: supply, demand and dynamic pricing (F11, F12)

- [ ] **T-3.1** (M, BE, P0) Implement pure `computePrice` per `architecture.md` section 7. **F12**
- [ ] **T-3.2** (M, QA, P0) Unit tests for `computePrice`: cold start, clamp min and max, smoothing, scarcity (S=1, high D), Rayleigh worked example (~508 from base 200). *Depends on:* T-3.1.
- [ ] **T-3.3** (M, BE, P0) Supply and demand queries: supply from open slots in 7 days, demand with exponential decay from `demand_events`. **F11**
- [ ] **T-3.4** (M, BE, P0) Pricing service: recompute per-skill multiplier, update all listings' `current_price`, append `price_history`. **F12** *Depends on:* T-3.1, T-3.3.
- [ ] **T-3.5** (S, BE, P0) Trigger recalculation after each new request and via 5-minute cron. *Depends on:* T-3.4.
- [ ] **T-3.6** (M, BE, P0) Market endpoints: `GET /market/overview` (per-skill S, D, ratio, multiplier, trend) and `GET /skills/:id/price-history`. **F11**
- [ ] **T-3.7** (S, BE, P1) `pricing_config` table and admin `GET/PUT /admin/pricing-config`.
- [ ] **T-3.8** (S, BE, P0) `POST /admin/simulate-rush`: inject demand events for a chosen skill to spike its price live.
- [ ] **T-3.9** (M, FE, P0) `PriceBadge` component (trend arrow, surge flame, "Rare Mastery" tag) used on every card and detail page. **F12**
- [ ] **T-3.10** (M, FE, P0) Price history line chart and supply vs demand bars on the skill page. **F11**
- [ ] **T-3.11** (M, FE, P0) "Why this price?" popover showing base price, supply, demand and multiplier.
- [ ] **T-3.12** (M, FE, P0) Market Dashboard: top movers, "Hot right now" strip, live ticker (React Query polling every ~10s). **F11**
- [ ] **T-3.13** (S, UI, P0) Seed script v2: historical requests and `price_history` so Rayleigh's Haki shows a rising curve and Cooking shows a falling one (an oversupplied skill).

**Exit check:** create a request live and watch the price rise on the market page without refreshing manually.

---

## Phase 4 — Theme and polish

- [ ] **T-4.1** (L, UI, P0) Landing page: Grand Line hero, "Set Sail" call to action, lore hook about Rayleigh's price surge.
- [ ] **T-4.2** (M, UI, P0) `BountyPoster` skill and provider cards (parchment texture, wanted-poster layout).
- [ ] **T-4.3** (S, UI, P0) Apply theme vocabulary across labels: Vivre Card, Treasure Chest, Held by Marine HQ, World Government tax, Bounty surge (see `rules.md` B8).
- [ ] **T-4.4** (S, UI, P0) Tier badges: Rookie, Supernova, Warlord, Legend.
- [ ] **T-4.5** (S, UI, P1) Category islands navigation (Wano, Fish-Man Island, Zou, Baratie, Sabaody).
- [ ] **T-4.6** (S, UI, P1) Subtle animations: price pulse on change, flame on surging skills, token count-up in the chest.
- [ ] **T-4.7** (M, FE, P0) Loading, empty and error states on every page; mobile layout pass.
- [ ] **T-4.8** (S, FE, P1) Toast notifications for request sent, accepted, completed, refunded.
- [ ] **T-4.9** (S, UI, P0) Confirm all art is original or freely licensed (no copied official artwork).

**Exit check:** a first-time viewer understands the theme and the price surge within 10 seconds of landing.

---

## Phase 5 — Stretch (only if P0 is stable)

- [ ] **T-5.1** (M, BE, P2) Peer-to-peer token gift/transfer (`POST /wallet/transfer`).
- [ ] **T-5.2** (M, BE+FE, P2) Skill-for-skill barter option.
- [ ] **T-5.3** (M, FE, P2) Leaderboards: top earners, top-rated, most in-demand skills.
- [ ] **T-5.4** (M, BE+FE, P2) Badges and achievements ("Haki Master", "100 Lessons").
- [ ] **T-5.5** (M, FE, P2) Recommended skills based on "skills wanted" and trending demand.
- [ ] **T-5.6** (M, BE+FE, P2) In-app notifications and price-drop watchlist.
- [ ] **T-5.7** (M, FE, P2) Admin panel UI for pricing parameters and token supply stats.

---

## Phase 6 — Ship: deploy, docs, demo

- [ ] **T-6.1** (M, QA, P0) Deploy database, API (single instance, so cron runs once) and frontend; set environment variables. *Depends on:* Phases 1–3.
- [ ] **T-6.2** (S, QA, P0) Run migrations and seed on the hosted environment; smoke-test the full loop there.
- [ ] **T-6.3** (S, QA, P0) Write `README.md`: overview, install, migrate, seed, run, test, demo accounts.
- [ ] **T-6.4** (S, QA, P0) Create demo accounts (learner, Rayleigh, admin) and write credentials into the README or presenter notes.
- [ ] **T-6.5** (M, All, P0) Rehearse the 3–4 minute demo script from `PRD.md` section 19, twice, with timing.
- [ ] **T-6.6** (S, QA, P0) Prepare fallback: local copy running, screen recording of the full loop, and screenshots.
- [ ] **T-6.7** (S, All, P0) Feature freeze, then bug fixes only.
- [ ] **T-6.8** (S, All, P0) Prepare slides or pitch: problem, solution, live pricing demo, architecture in one diagram, theme.

---

## Requirement traceability

| PRD feature | Requirement | Tasks |
|---|---|---|
| F1 | User profiles | T-1.4, T-1.5, T-1.9, T-1.10 |
| F2 | List skills | T-1.6, T-1.7, T-1.11 |
| F3 | Search and filter | T-2.1, T-2.10 |
| F4 | Display providers | T-2.2, T-2.11, T-2.16 |
| F5 | Token-based prices | T-1.7, T-1.11 |
| F6 | Request sessions | T-2.3, T-2.12 |
| F7 | Accept or reject | T-2.4, T-2.13 |
| F8 | Record completed sessions | T-2.5, T-2.14 |
| F9 | Transfer tokens | T-1.3, T-2.5, T-2.7, T-2.15 |
| F10 | Rate sessions | T-2.6, T-2.14 |
| F11 | Track supply and demand | T-3.3, T-3.6, T-3.10, T-3.12 |
| F12 | Demand-based price updates | T-3.1 to T-3.5, T-3.9, T-3.11 |

## Critical path

`T-1.1 → T-1.3 → T-2.3 → T-2.5 → T-3.4 → T-3.5 → T-3.12 → T-6.1 → T-6.5`

Anything on this path slipping puts the demo at risk. Protect the wallet tasks (T-1.3, T-2.3, T-2.5, T-2.17) above all else.

## Suggested parallel work

| Stage | BE | FE | UI | QA |
|---|---|---|---|---|
| Phase 1 | T-1.1 to T-1.8 | T-1.9 to T-1.11 (mock data at first) | T-1.12, T-1.13 | Set up test DB and tooling |
| Phase 2 | T-2.1 to T-2.9 | T-2.10 to T-2.16 | Poster and card designs | T-2.17 to T-2.19 |
| Phase 3 | T-3.1 to T-3.8 | T-3.9 to T-3.12 | T-3.13, start T-4.x | T-3.2, integration checks |
| Phase 4–6 | Bug fixes, stretch | T-4.7, T-4.8 | T-4.1 to T-4.9 | T-6.x |

## Cut list (drop in this order if time runs out)

1. Phase 5 stretch items
2. T-4.5, T-4.6, T-4.8 (islands nav, animations, toasts)
3. T-3.7 admin pricing config (hard-code defaults instead)
4. T-2.16 provider profile page
5. T-1.5 profile editing beyond name and bio

**Never cut:** wallet transactions (T-1.3, T-2.3, T-2.5), the pricing engine (T-3.1 to T-3.5), the price-history chart (T-3.10), and the simulate-rush action (T-3.8). They make the demo.

## Definition of done (per task)

Matches the rules in `rules.md` B13: validation and authorisation in place, token operations transactional, at least one failure path tested, UI states handled, and the feature run once end to end.
