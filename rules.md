# Rules — Grand Line Skill Exchange (PS-05)

**Read this first.** This file is the rulebook for anyone (or any AI assistant) writing code for this project. It has two parts:

- **Part A — Business Rules:** how the marketplace and token economy must behave. These are non-negotiable and must match `PRD.md`.
- **Part B — Engineering Rules:** how code must be written, structured and tested. These match `architecture.md`.

If a request conflicts with this file, follow this file and flag the conflict.

---

# Part A — Business Rules

## A1. Tokens (Vivre Card Tokens, VCT)
1. VCT is an internal currency with no real-world value. There is no cash in or cash out.
2. Every new user receives exactly **500 VCT** once, at registration, recorded as a `GRANT` transaction.
3. Token amounts are **whole integers**. No decimals, ever.
4. A balance can **never go negative**.
5. Tokens are created only by `GRANT` and destroyed only by `BURN`. Everything else moves tokens between a balance and escrow, or between users.

## A2. Pricing
1. Displayed price = `base_price × multiplier`, rounded to the nearest whole token.
2. Providers set the **base price** only. They cannot set the multiplier or the final price directly.
3. Base price must stay inside the admin-configured band (default **10–1000 VCT**).
4. The multiplier is computed **per skill** from supply and demand, then applied to each listing's base price.
5. The multiplier is always **clamped** to the configured range (default **0.7 to 3.0**) and **smoothed** (default alpha 1.0 for demo, lower to 0.3 for production).
6. **Supply** = active listings for the skill that have at least one unbooked slot in the next 7 days.
7. **Demand** = time-decayed count of session requests for the skill over the last 7 days.
8. With no demand history, the multiplier is **1.0**.
9. Every recalculation writes a `price_history` row (supply, demand, multiplier, price). No silent price changes.
10. **Price lock:** the price is fixed at the moment a request is sent (`locked_price`). Later changes never affect it.

## A3. Session Requests
1. A learner **cannot** request their own listing.
2. A request needs: an active listing, a free slot in the future, and a balance ≥ the current price.
3. Sending a request **immediately moves** `locked_price` from `balance` into `escrow_held` (an `ESCROW` transaction).
4. A slot can hold only **one active request** at a time (no double-booking).
5. Status flow (no other transitions are allowed):

```
PENDING  → ACCEPTED | REJECTED | CANCELLED | EXPIRED
ACCEPTED → COMPLETED | CANCELLED
```

6. Only the **provider** can accept or reject. Only the **learner** can cancel (while `PENDING`).
7. `PENDING` requests expire automatically after **48 hours**.
8. `REJECTED`, `CANCELLED` and `EXPIRED` requests are **fully refunded** (`REFUND` transaction) and the slot is freed.
9. An `ACCEPTED` request cancelled because of a provider no-show or a dispute is also fully refunded and flagged.

## A4. Completing Sessions and Payment
1. A session can only be marked done after its scheduled start time.
2. Completion needs the provider to mark it done and the learner to **confirm**. If the learner does not respond or dispute within **24 hours**, it auto-confirms.
3. On completion, escrow is released: **95% to the provider** (`RELEASE`), **5% burned** (`BURN`). Rounding: the burn is `floor(price × 0.05)`, the provider gets the remainder, so nothing is created or lost.
4. Payment is released **exactly once**. Repeating the action must be safe and change nothing.

## A5. Ratings
1. Only the learner of a `COMPLETED` session can rate it.
2. One rating per session, score is an integer from **1 to 5**, review text optional (max 500 characters).
3. Ratings cannot be edited or deleted in the MVP.
4. Provider and listing averages update immediately after a rating.
5. Provider **tier** is based on completed sessions and average rating (Rookie → Supernova → Warlord → Legend). Thresholds are configuration, not hard-coded in UI.

## A6. Profiles and Listings
1. Every user can be both learner and provider.
2. Skill categories are fixed by the seed data; users pick from them and cannot invent new categories in the MVP.
3. A listing needs: skill, description, level, duration (30, 60 or 90 min), base price, and at least one slot to appear in search.
4. A user can have only **one active listing per skill**.
5. Deactivating a listing does not affect requests already `PENDING` or `ACCEPTED`.

## A7. Integrity Invariants (must always hold)
1. **Conservation:** `sum(all balances) + sum(all escrow_held) = total GRANT − total BURN`.
2. **Per user:** `balance + escrow_held` equals the net sum of that user's ledger rows.
3. `escrow_held` for a user equals the sum of `locked_price` on their `PENDING` and `ACCEPTED` requests.
4. No completed session has more than one `RELEASE`.

---

# Part B — Engineering Rules

## B1. General Principles
1. **Make it work, then make it themed.** Build the functional loop first; theme is a layer on top.
2. **Small, reviewable changes.** One feature or fix per change. Do not refactor unrelated code.
3. **Do not invent features, endpoints, tables or fields** that are not in `PRD.md` or `architecture.md`. If something is missing, say so and propose it.
4. **Never hard-code business numbers** (tax rate, starting grant, clamp band, expiry hours). Put them in one config module.
5. Prefer **simple and readable** over clever. This code must be explainable in a demo.

## B2. Tech Stack (do not swap without agreement)
- Frontend: React 18 + Vite + Tailwind + React Query + Recharts.
- Backend: Node.js 20 + Express + Prisma + Zod.
- Database: PostgreSQL.
- Jobs: `node-cron`, in-process.
- Language: JavaScript (or TypeScript if the team agrees once, then everywhere).

## B3. Token and Database Rules (highest priority)
1. **Every token movement happens inside a database transaction**, together with the state change it belongs to.
2. **All wallet code lives in the Wallet module.** No other module updates `balance`, `escrow_held` or writes ledger rows directly. Other modules call `hold()`, `release()`, `refund()`, `grant()`.
3. Lock rows (`SELECT ... FOR UPDATE`) before reading and changing balances or slots.
4. Guard status changes: update with `WHERE status = '<expected>'` and treat zero rows updated as "already processed".
5. The `transactions` table is **append-only**: never update or delete rows.
6. Keep the database CHECK constraint `balance >= 0`.
7. Never trust the client for prices, balances or user IDs. Read prices from the database and the user from the auth token.

## B4. Pricing Code Rules
1. `computePrice` is a **pure function**: no database, no `Date.now()`, no randomness inside.
2. Config values are passed in as arguments.
3. Any change to the formula needs updated unit tests in the same change.
4. The UI must be able to explain a price using stored data (`price_history`), so never compute a price the UI cannot justify.

## B5. API Rules
1. All routes live under `/api/v1`.
2. Validate every request body and query with **Zod** before touching the database.
3. Authenticate every route except register, login and public browsing (`GET /skills`, `GET /listings`).
4. Check **authorisation** on every mutation (owner or role checks).
5. Errors use one shape: `{ "error": { "code": "...", "message": "..." } }` with a proper HTTP status. Use stable codes such as `INSUFFICIENT_TOKENS`, `SLOT_TAKEN`, `INVALID_STATE`, `FORBIDDEN`, `NOT_FOUND`.
6. Never return password hashes or other users' private data.
7. List endpoints support `page` and `limit`.

## B6. Backend Structure
1. Follow the module layout in `architecture.md`: `routes → controller → service → repository (Prisma)`.
2. Business logic goes in **services**, not in routes or React components.
3. Modules communicate through service functions, not by reaching into each other's tables (exception: read-only market queries).
4. Background jobs must be **idempotent** and log a one-line summary each run.
5. Environment variables only for secrets and URLs. Never commit `.env`.

## B7. Frontend Rules
1. Use React Query for all server data; no manual fetch-in-useEffect for API calls.
2. Every page needs **loading, empty and error states**.
3. Show token amounts with the VCT icon and thousands separators. Show price trend (up, down, flat) wherever a price appears.
4. Disable action buttons while a request is in flight (prevents double-clicks and double requests).
5. Confirm destructive or token-spending actions ("Send Vivre Card for 508 VCT?").
6. Colours, fonts and spacing come from the Tailwind theme tokens, not one-off values.
7. Must be usable on a phone-width screen.
8. Do not rely on `localStorage` for anything other than the auth token.

## B8. Theme Rules (One Piece)
1. Theme lives in the UI layer, seed data and copy. **Business logic uses neutral names** (`tokens`, `listing`, `session`); the theme names (Vivre Card, Treasure Chest, Bounty Poster) appear in labels and components only.
2. Use **original or freely licensed art** and stylised icons, emoji and CSS effects. Do not copy official artwork, manga panels or logos.
3. Keep theme copy fun but readable. Clarity beats jokes on buttons and error messages.
4. Provide a consistent vocabulary:

| Concept | Theme term |
|---|---|
| Token | Vivre Card Token (VCT) |
| Wallet | Treasure Chest |
| Request | Send Vivre Card |
| Escrow | Held by Marine HQ |
| Platform tax | World Government tax |
| Surging price | Bounty surge |
| Provider tiers | Rookie, Supernova, Warlord, Legend |

## B9. Testing Rules
1. Must have tests for: `computePrice`, wallet `hold/release/refund`, request state transitions, and the full loop (register → list → request → accept → complete → rate).
2. Must test failure cases: insufficient tokens, slot already taken, wrong-role action, repeated release, expired request.
3. After the test suite runs, the **conservation invariant** (A7.1) must hold.
4. A feature is not done until its happy path and at least one failure path are tested.

## B10. Code Style
1. One formatter and linter (Prettier + ESLint), run before every commit.
2. Names: `camelCase` variables and functions, `PascalCase` components, `snake_case` database columns, `UPPER_SNAKE` constants and enum values.
3. Comments explain **why**, not what. Every non-obvious money or pricing line gets a short comment.
4. No dead code, no commented-out blocks, no leftover `console.log`.
5. Functions do one thing; keep files under about 300 lines.

## B11. Git and Team Workflow
1. Branch per feature: `feat/…`, `fix/…`. Do not commit straight to `main` after the first working skeleton.
2. Commit messages: `type: short summary` (for example `feat: escrow on session request`).
3. Pull latest `main` before starting; resolve conflicts locally.
4. Do not change the Prisma schema without telling the team; schema changes come with a migration and updated seed data.
5. Keep `README.md` current: how to install, migrate, seed, run and test.

## B12. Rules for AI Coding Assistants
When using an AI assistant to write code for this project:
1. Give it `PRD.md`, `architecture.md` and this file as context at the start of each session.
2. Ask for **one feature at a time**, and ask it to name the files it will touch before changing them.
3. Review every generated change that touches **tokens, prices or auth** line by line. Never paste it in unread.
4. Reject any generated code that updates balances outside the Wallet module, hard-codes business numbers, or skips validation.
5. Ask the assistant to write or update tests with each change, and run them before accepting.
6. If the assistant is unsure about a rule, it should **ask** rather than guess.
7. Do not let it add new dependencies without a stated reason.

## B13. Definition of Done
A feature is done when:
- [ ] It matches the PRD requirement and the rules above.
- [ ] Validation, authorisation and error handling are in place.
- [ ] Token operations are transactional (if applicable).
- [ ] Tests pass, including a failure path.
- [ ] UI has loading, empty and error states.
- [ ] Seed data supports demoing it.
- [ ] It has been run once end to end in the browser.

## B14. Demo-Readiness Rules
1. Seed data must include the **Rayleigh's Advanced Haki surge** (supply 1, high demand, rising price history) and an **oversupplied skill** with a falling price.
2. Keep a **"Simulate Pirate Rush"** admin action working so price changes can be shown live.
3. Before the presentation: reset the database, run seed, and rehearse the demo script from the PRD once.
4. Freeze features at least a few hours before the demo; only bug fixes after that.

---
*Prepared for PS-05 — Peer-to-Peer Skill Marketplace with Demand-Based Pricing (One Piece theme). Keep in sync with `PRD.md` and `architecture.md`.*
