# PRD — Grand Line Skill Exchange
**Problem Statement:** PS-05 — Peer-to-Peer Skill Marketplace with Demand-Based Pricing
**Domain:** Skill Market & Dynamic Economy
**Theme:** One Piece — *Silvers Rayleigh Haki Academy & Revolutionary Army Skill Exchange*
**Version:** 1.0 (Hackathon MVP)

---

## 1. Overview

**Grand Line Skill Exchange** is a peer-to-peer marketplace where community members teach and learn skills using an internal currency, **Vivre Card Tokens (VCT)**. Each skill's price floats automatically with supply (available teachers) and demand (session requests), so scarce, in-demand skills cost more and oversupplied skills cost less.

**Lore hook:** Rayleigh's *Advanced Conqueror's Haki* lessons are skyrocketing in price because pirates are flooding in before heading to the New World. The live price surge is the hero moment of the demo.

## 2. Goals & Non-Goals

### Goals
- Let any user offer skills and learn skills without real money.
- Make prices respond visibly and explainably to supply and demand.
- Provide a trustworthy token flow (escrow, transfer, refund) and a rating system.
- Ship a polished, themed, demo-ready MVP.

### Non-Goals (MVP)
- Real-money payments, KYC, or withdrawals.
- Live video calling (sessions are scheduled/recorded; a meeting link field is enough).
- Native mobile apps (responsive web only).
- Complex dispute resolution (basic report flag only).

## 3. Target Users & Personas

| Persona | One Piece skin | Need |
|---|---|---|
| **Learner** | Rookie Pirate | Find a teacher, know the price, book a session, pay safely. |
| **Provider** | Master / Legend | List skills, set base price, accept or reject requests, earn tokens, build reputation. |
| **Admin** (optional) | Fleet Admiral / Revolutionary Command | Tune pricing parameters, monitor the economy, moderate. |

## 4. Theme Mapping

| Platform concept | One Piece element |
|---|---|
| Platform name | Grand Line Skill Exchange |
| Token | Vivre Card Token (VCT) |
| Wallet | Treasure Chest |
| Skill categories | Haki, Swordsmanship, Fish-Man Karate, Navigation, Black Leg Cooking, Devil Fruit Mastery, Shipwright |
| Provider tiers | Rookie → Supernova → Warlord → Yonko-level Legend (by completed sessions and rating) |
| Provider examples | Silvers Rayleigh (Haki), Zoro (Santoryu), Jinbe (Fish-Man Karate), Nami (Navigation), Sanji (Black Leg Style) |
| Session request | "Send Vivre Card" (the request is a Vivre Card sent to the teacher) |
| Escrow | Pouch held by Marine HQ until the lesson is complete |
| Platform fee | "World Government tax", burned to keep the economy stable |
| High demand indicator | "Bounty Poster" price tag that rises with demand |
| Rating | Bounty-style rating: 1 to 5 Berries (or Jolly Rogers) |
| Islands / sections | Skill categories as islands: Sabaody (all skills), Fish-Man Island (Karate), Zou (Navigation), Baratie (Cooking), Wano (Swordsmanship) |

> Note: use original or freely licensed art. For the demo, stylised icons, emoji and CSS effects work fine.

## 5. Functional Requirements

### 5.1 Coverage matrix (from the problem statement)

| # | Requirement | Feature | Priority |
|---|---|---|---|
| 1 | Create user profiles | F1 | P0 |
| 2 | List available skills | F2 | P0 |
| 3 | Search and filter skills | F3 | P0 |
| 4 | Display skill providers | F4 | P0 |
| 5 | Set token-based skill prices | F5 | P0 |
| 6 | Request learning sessions | F6 | P0 |
| 7 | Accept or reject session requests | F7 | P0 |
| 8 | Record completed sessions | F8 | P0 |
| 9 | Transfer internal tokens | F9 | P0 |
| 10 | Rate completed sessions | F10 | P0 |
| 11 | Track skill supply and demand | F11 | P0 |
| 12 | Update prices based on demand and availability | F12 | P0 |

### 5.2 Feature details

**F1 — User profiles**
- Sign up / log in (email + password, or simple username login for the hackathon).
- Profile: display name, avatar, bio, crew/ship name, skills offered, skills wanted, average rating, sessions taught and learned, tier.
- New users receive a starting grant of **500 VCT**.

**F2 — Skill listings**
- A provider creates a listing: skill, description, level, session duration (30/60/90 min), base price, availability slots.
- Listing card shows: skill name, provider, current price, price trend arrow, rating, demand badge.

**F3 — Search and filter**
- Text search across skill name, description, provider name.
- Filters: category, price range, minimum rating, availability, demand level (Hot / Stable / Cool), sort (price, rating, demand, newest).

**F4 — Provider display**
- Skill detail page lists all providers for that skill with rating, sessions completed, price, next available slot, tier badge.
- Provider profile shows their listings and recent reviews.

**F5 — Token pricing**
- Provider sets a **base price** (in VCT) per listing, within a min/max band set by admin.
- Displayed price = base price × demand multiplier (see F12).
- Price is **locked at the moment the request is sent**, so later surges do not affect an existing request.

**F6 — Request a session**
- Learner selects a provider, slot, and optional message, then sends a request.
- System checks the learner's balance is at least the current price.
- Tokens are moved into **escrow** immediately. Request status: `PENDING`.

**F7 — Accept or reject**
- Provider sees a request inbox. Accept → `ACCEPTED`; reject (optional reason) → `REJECTED` and the escrow is refunded in full.
- Requests auto-expire after 48 hours with a full refund (`EXPIRED`).
- Learner may cancel a `PENDING` request for a full refund.

**F8 — Record completed sessions**
- After the scheduled time, the **provider** marks the session done; the session is confirmed as `COMPLETED` when the learner confirms (or auto-confirms after 24h if the learner does not dispute).
- A completed session is stored with timestamp, duration, price paid, and participants.

**F9 — Token transfers**
- On completion, escrow is released: **95% to the provider, 5% burned** as tax.
- Every movement (grant, escrow hold, release, refund, burn) is recorded in an immutable **transaction ledger** visible in the user's Treasure Chest.
- Optional stretch: peer-to-peer tip / gift of tokens.

**F10 — Ratings**
- Only the learner of a `COMPLETED` session can rate (1–5 plus optional review), once per session.
- Provider and listing averages update immediately. Rating influences tier and search ranking.

**F11 — Supply and demand tracking**
- **Supply (S)** for a skill = number of active providers with at least one open slot in the next 7 days.
- **Demand (D)** for a skill = weighted count of session requests in the last 7 days (recent requests weigh more), plus search and view interest as a minor signal (stretch).
- Dashboard shows per-skill S, D, D/S ratio, and price history.

**F12 — Dynamic price updates**
- Prices recalculate on a schedule (every 5 minutes, or on each new request for demo responsiveness).
- Formula in section 6.

### 5.3 Key user flows

1. **Learner books a lesson:** Browse Sabaody Market → open *Advanced Conqueror's Haki* → see Rayleigh's surging price → Send Vivre Card → tokens held in escrow.
2. **Provider responds:** Requests inbox → accept or reject → session happens.
3. **Completion and payment:** Session marked done → learner confirms → tokens released to the provider (5% burned) → learner rates.
4. **Market reacts:** New requests raise D → price multiplier rises → "Bounty Poster" shows the increase → a new provider enters the market → S rises → price eases.

## 6. Pricing Engine

### Inputs
- `base_price` — provider-set base price per listing
- `S` — active supply (providers with open slots)
- `D` — weighted recent demand (requests in the last 7 days, exponentially decayed)

### Formula (simple and explainable)

```
pressure   = D / max(S, 1)                      # demand per available provider
raw_mult   = 1 + k * ln(1 + pressure)           # k = sensitivity, e.g. 0.6
target     = clamp(raw_mult, MIN_MULT, MAX_MULT)  # e.g. 0.7 to 3.0
multiplier = (1 - a) * previous_multiplier + a * target   # smoothing, a = 1.0 (instant for demo; lower to 0.3 for production smoothing)
price      = round(base_price * multiplier)
```

- **Smoothing** prevents wild price swings (set `a = 1.0` for the hackathon demo so prices react instantly; lower to 0.3 for production).
- **Clamp** keeps prices within a sane band (no price above 3x base or below 0.7x base).
- **Cold start:** if there is no demand history, multiplier = 1.0.
- **Scarcity floor:** if S = 1 and D is high, the skill is flagged "Rare Mastery" (a UI badge; the price is still bounded by the clamp).
- Parameters (`k`, `a`, `MIN_MULT`, `MAX_MULT`, window) are configurable in an admin panel. Default `a = 1.0` for demo.

### Worked example (Rayleigh's Haki)
- base = 200 VCT, S = 1 (only Rayleigh), D = 12 requests
- pressure = 12, raw = 1 + 0.6 × ln(13) ≈ 2.54, clamped target 2.54
- price ≈ 200 × 2.54 ≈ **508 VCT** → "Bounty surged +154%"

### Transparency
Each listing shows a **"Why this price?"** popover: base price, supply, demand, multiplier, and a 30-day price chart. This makes the dynamic economy visible to judges.

## 7. Token Economy Rules

| Rule | Value |
|---|---|
| Starting grant | 500 VCT per new user |
| Platform tax | 5% of each completed session, burned |
| Escrow | Held from request until completion, then released or refunded |
| Balance rule | Balance can never go negative; a request is blocked if funds are insufficient |
| Price lock | Price fixed at request time |
| Refund cases | Rejected, expired, cancelled by the learner while `PENDING`, or provider no-show |
| Earning loop | Users can teach to earn tokens, which keeps the economy circulating |

All token operations run inside **database transactions** so escrow and balances remain consistent.

## 8. Session Lifecycle (state machine)

```
PENDING ──accept──▶ ACCEPTED ──complete──▶ COMPLETED ──▶ (rated)
   │                    │
   ├─reject──▶ REJECTED (refund)
   ├─expire──▶ EXPIRED  (refund)
   └─cancel──▶ CANCELLED (refund)
                        └─no-show/dispute──▶ CANCELLED (refund, flagged)
```

## 9. Data Model

| Table | Key fields |
|---|---|
| `users` | id, name, email, password_hash, bio, avatar, crew, tier, balance, created_at |
| `skills` | id, name, category, description, icon |
| `listings` | id, provider_id, skill_id, base_price, current_price, multiplier, duration_min, level, active |
| `availability_slots` | id, listing_id, start_at, end_at, is_booked |
| `session_requests` | id, learner_id, listing_id, slot_id, locked_price, status, message, created_at, expires_at |
| `sessions` | id, request_id, started_at, completed_at, duration_min, meeting_link |
| `ratings` | id, session_id, rater_id, provider_id, score, review, created_at |
| `transactions` | id, user_id (nullable), type (GRANT / ESCROW / RELEASE / REFUND / BURN / TRANSFER), amount, request_id, created_at |
| `demand_events` | id, skill_id, type (REQUEST / VIEW), weight, created_at |
| `price_history` | id, listing_id, skill_id, supply, demand, multiplier, price, recorded_at |

## 10. API Surface (REST)

| Area | Endpoints |
|---|---|
| Auth / users | `POST /auth/register`, `POST /auth/login`, `GET/PUT /users/:id` |
| Skills | `GET /skills`, `GET /skills/:id` (with providers, supply, demand) |
| Listings | `POST /listings`, `GET /listings?category=&minRating=&maxPrice=&q=&sort=`, `PUT /listings/:id` |
| Requests | `POST /requests`, `GET /requests?role=learner|provider`, `POST /requests/:id/accept`, `/reject`, `/cancel` |
| Sessions | `POST /sessions/:id/complete`, `POST /sessions/:id/confirm` |
| Ratings | `POST /sessions/:id/rate`, `GET /users/:id/ratings` |
| Wallet | `GET /wallet`, `GET /wallet/transactions`, `POST /wallet/transfer` (stretch) |
| Market | `GET /market/overview`, `GET /skills/:id/price-history` |
| Admin | `GET/PUT /admin/pricing-config` |

## 11. Screens / UX

1. **Landing / Login** — Grand Line map hero, "Set Sail" CTA.
2. **Sabaody Market (home)** — skill cards grid, filter bar, "Hot right now" strip with surging skills.
3. **Skill detail** — price chart, supply/demand gauge, provider list, "Send Vivre Card" button.
4. **Provider profile** — bounty-poster style card, tier badge, listings, reviews.
5. **Treasure Chest (wallet)** — balance, escrow held, transaction ledger.
6. **Requests inbox** — tabs for "Sent" and "Received", accept/reject actions.
7. **My Sessions** — upcoming and completed sessions, rate button.
8. **Market Dashboard** — supply vs demand per skill, top movers, live price ticker.
9. **Admin panel (stretch)** — pricing parameters, user overview.

**Visual direction:** parchment textures, wanted-poster cards, compass and Log Pose accents, ocean-blue and gold palette, a Vivre Card icon for the token, and a subtle pulse or flame animation on surging prices. Keep the interface usable first, themed second.

## 12. Suggested Tech Stack

Choose whatever the team can move fastest with. A sensible default for a hackathon:

| Layer | Option |
|---|---|
| Frontend | React (Vite) + Tailwind, Recharts for price charts |
| Backend | Node.js + Express (or FastAPI) |
| Database | PostgreSQL (or SQLite for the demo; Supabase/Firebase also works) |
| Jobs | `node-cron` (or a simple interval) for price recalculation and request expiry |
| Realtime (stretch) | WebSocket or polling for live price ticker |
| Hosting | Vercel + Render/Railway |

## 13. Non-Functional Requirements

- **Consistency:** all token movements are atomic transactions; no double-spend on escrow.
- **Performance:** listing pages load in under 2 seconds with seeded data.
- **Security:** hashed passwords, authenticated routes, users can only act on their own requests, input validation.
- **Reliability:** pricing job is idempotent; failed jobs do not corrupt prices.
- **Usability:** responsive down to mobile width; clear empty and error states.
- **Auditability:** ledger is append-only.

## 14. Seed Data (for the demo)

- **Providers:** Silvers Rayleigh (Advanced Conqueror's Haki, S = 1), Roronoa Zoro and a second swordsman (Santoryu Swordsmanship), Jinbe (Fish-Man Karate), Nami (Navigation), Sanji (Black Leg Style Cooking), plus 5+ extra generic providers so some skills have healthy supply.
- **Learners:** 5+ users with balances, and 15+ historical requests so charts show real curves.
- **Pre-seeded rising trend:** Rayleigh's Haki starts with a visible upward price history.
- **Contrast pair:** one oversupplied skill with a falling price (e.g., Cooking with many providers) to show both directions.

## 15. Success Metrics

**Demo / judging criteria**
- All 12 required features working end to end.
- Price visibly changes after new requests are made live during the demo.
- Full token loop demonstrated: request → escrow → accept → complete → release → rate.
- Theme integration is clear and consistent.

**Product metrics (if extended)**
- Request → accept rate, session completion rate.
- Average time to first accepted request.
- Price stability (volatility per skill).
- Token velocity and share of tokens burned.

## 16. Milestones (hackathon-sized)

| Phase | Scope |
|---|---|
| **1 — Foundation** | Schema, auth, profiles, skills, listings, seed data |
| **2 — Core loop** | Search/filter, provider view, request → escrow → accept/reject → complete → release, ratings |
| **3 — Economy** | Supply/demand tracking, pricing engine, price history, market dashboard |
| **4 — Theme & polish** | One Piece UI, bounty posters, animations, "Why this price?" popover |
| **5 — Demo prep** | Seed data tuning, demo script, README, deploy |

**Suggested team split:** one person on backend and token/pricing logic, one on frontend screens, one on theme/UI polish and seed data, one on QA, demo script and docs.

## 17. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Price swings look erratic | Smoothing, clamp band, and a clear "Why this price?" explanation |
| Token bugs (negative balance, double escrow) | Database transactions, balance checks, ledger as source of truth |
| Empty marketplace at demo time | Rich seed data plus a "simulate demand" button |
| Scope creep | Strict P0 list; everything else is stretch |
| Theme overshadows function | Build the functional loop first; theme layer second |

## 18. Stretch Goals

- "Simulate Pirate Rush" admin button to spike demand live in the demo.
- Skill-for-skill barter option (swap lessons without tokens).
- Provider badges and achievements ("Haki Master", "100 Lessons").
- Recommended skills for learners based on wants and trending demand.
- Leaderboard: top earners, top-rated teachers, most in-demand skills.
- Peer-to-peer token gifting and crew (group) wallets.
- Email or in-app notifications for requests and price drops on watched skills.

## 19. Demo Script (3–4 minutes)

1. Open Sabaody Market; point out the "Hot right now" strip with Rayleigh's Haki surging.
2. Open the skill; show the price chart, supply (1 provider) vs demand (high), and "Why this price?".
3. As a learner, send a Vivre Card; the balance drops and escrow appears in the Treasure Chest.
4. Switch to Rayleigh's account; accept the request.
5. Complete the session; tokens release (95% to Rayleigh, 5% burned); leave a rating.
6. Show the price ticking up after the new request; then add a second Haki provider and show the price easing.
7. Show the oversupplied skill (Cooking) with a falling price to prove the system works in both directions.

---
*Prepared for PS-05 — Peer-to-Peer Skill Marketplace with Demand-Based Pricing (One Piece theme).*
