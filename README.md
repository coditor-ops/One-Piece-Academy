[README.md](https://github.com/user-attachments/files/32737688/README.md)
# One Piece Academy — Grand Line Skill Exchange (PS-05)

A One Piece themed peer-to-peer skill marketplace with demand-based pricing. Learners trade skills using an in-app currency, **Vivre Card Tokens (VCT)**. The price of a skill rises when many people want it and few teach it, and falls when the opposite is true.

This repository holds the **front-end demo**: a single web page with no server or database. The full plan (React, Express, PostgreSQL) is described in `PRD.md`, `architecture.md`, `rules.md` and `Task.md`.

**Live demo:** https://claude.ai/artifact/WZN9LmV5u6xoRxFgiU1rvP

---

## Features

- **Scroll-driven video background.** Scrolling moves the video forward or back. When you stop scrolling, it plays on its own and loops.
- **Interactive home page.** Search, category filter, animated stat counters, skill carousel, 3D card tilt and click ripples.
- **Demand-based pricing.** `price = round(base × multiplier)`, where the multiplier comes from demand ÷ supply and is clamped to 0.7–3.0.
- **Pirate Rush.** The "Simulate Pirate Rush" button adds demand to a random skill so you can watch its price surge live.
- **Login system.** Register, log in and log out. A new account gets 500 VCT once.
- **Booking.** "Send Vivre Card" moves tokens into escrow ("Held by Marine HQ") at a locked price.
- **Menu pages.**
  - *Explore Skills:* all skills with sorting.
  - *Find Mentors:* mentors with their tier (Rookie, Supernova, Warlord, Legend).
  - *My Sessions:* cancel and refund, simulate accept, and mark complete (95% to the mentor, 5% World Government tax).
- **Accessible.** Keyboard navigation, visible focus outlines, a mobile menu, and reduced-motion support.

---

## Run it

### Option 1: single file (video included)
Open `index.html` in a browser. The video is embedded, so no other file is needed.

### Option 2: readable source
The `site/` folder has the same page with the video kept as a separate file.

```
site/
├── index.html        # HTML, CSS and JavaScript (about 25 KB)
└── background.mp4    # background video (must stay next to index.html)
```

1. Keep both files in the same folder.
2. Open `site/index.html` in a browser.
3. If the video does not react to scroll when opened directly from disk, run a small local server:

```bash
cd site
python3 -m http.server 8000
# then open http://localhost:8000
```

No install, build or database is needed.

---

## How to try the demo (3–4 minutes)

1. **Landing.** Scroll slowly and watch the video move, then stop and see it keep playing.
2. **Register.** Click **Set Sail**, create an account and see 500 VCT in the Treasure Chest.
3. **Price surge.** Look at Rayleigh's *Advanced Conqueror's Haki* (about 502 VCT with supply 1 and high demand). Compare it with *Black Leg Style Cooking* (about 175 VCT, oversupplied).
4. **Pirate Rush.** Press **⚡ Simulate Pirate Rush** and watch a price flash and climb.
5. **Book.** Click a skill, read the price breakdown, and confirm **Send Vivre Card**. Tokens move to "Held by Marine HQ".
6. **My Sessions.** Simulate accept, then Mark complete. The mentor receives 95% and 5% goes to tax.
7. **Explore Skills and Find Mentors.** Try the sort menu and the mentor tiers.

There are no pre-made demo accounts. Register your own.

---

## Pricing formula

```
multiplier = clamp(0.7, 3.0, 0.55 + (demand / supply) × 0.28)
price      = round(base_price × multiplier)
```

Worked example: Rayleigh's Haki has base price 200, supply 1 and demand 7. That gives a multiplier of 2.51 and a price of 502 VCT.

Settings live in one place, the `CFG` object at the top of the script: starting grant (500), multiplier range, demand weight, tax rate (5%) and tier thresholds.

---

## Tech

| Area | Choice |
|---|---|
| Language | Vanilla HTML, CSS and JavaScript (no framework or build step) |
| Fonts | Pirata One and Inter (Google Fonts) |
| Video | 1280×720 H.264, no audio, keyframe every 8 frames for smooth scrubbing (about 4 MB) |
| Storage | Browser `localStorage` (accounts and balances stay on one device) |
| Hosting | Published as a single-file artifact |

---

## Known limits

- **Demo login only.** Accounts are stored in the browser. Passwords are hashed with SHA-256, but this is **not real security**. Real login needs the planned Express backend with bcrypt and JWT.
- **No shared data.** Nothing is saved on a server, and skill prices reset on reload.
- **Simplified economy.** Pricing has no smoothing or price history, and there is no ratings screen or ledger table yet.
- **Not tested.** There are no automated tests, and scroll smoothness has not been checked on real phones.

---

## Mapping to the plan

| Planned piece | In this demo |
|---|---|
| React, Vite, Tailwind | Vanilla JS in one file |
| Express API and modules | Plain functions |
| PostgreSQL and ledger | In-memory list and `localStorage` |
| `computePrice` | `calc` function (simplified) |
| Wallet and escrow module | `bal` and `esc` variables |
| node-cron jobs | `setInterval` timer |
| Auth (bcrypt, JWT) | Demo login in `localStorage` |
| Ratings, price history, admin | Not built yet |

---

## Next steps

1. Move pricing and wallet logic into Express modules and save data in PostgreSQL.
2. Replace the demo login with bcrypt and JWT.
3. Add ratings, the price-history chart, and the "Why this price?" popover.
4. Add tests for pricing, wallet hold/release/refund, and the full booking loop.

---

## Art and licensing

All page art is original: emoji, CSS shapes and effects. The background video is the team's own upload. No official artwork, logos or manga panels are included, as required by `rules.md` (B8).

---

*Prepared for PS-05 — Peer-to-Peer Skill Marketplace with Demand-Based Pricing (One Piece theme).*
