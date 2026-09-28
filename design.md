# Design System — Grand Line Skill Exchange (PS-05)

Companion docs: `PRD.md`, `architecture.md`, `rules.md`, `Task.md`.
This file is the single source of truth for how the app looks and feels. Frontend and UI tasks (`T-1.12`, `T-3.9`, `T-4.x`) build from it.

---

## 1. Design Vision

**Concept:** a night-time port on the Grand Line. A deep, dark ocean interface, lit by gold (treasure) and ember-red (bounty and surge). Content lives on wanted-poster style cards.

**Design pillars**
1. **Dark and cinematic.** Deep navy-black surfaces, warm gold highlights, strong contrast. The app should look like a polished game HUD, not a spreadsheet.
2. **The price is the hero.** Every surge, drop and multiplier is visible and explained. If a number moves, the UI shows it moving.
3. **Themed, but readable.** One Piece flavour in labels, icons and texture; layout and typography stay clean and scannable.
4. **Trust around tokens.** Anything that spends or holds tokens is calm, explicit and confirmed. Fun stops where money-like actions start.

**Mood words:** nocturnal, adventurous, treasure, weathered, electric.

**Mood references (style only, no copied assets):** naval charts, wanted posters, ship lanterns, game inventory screens, trading dashboards.

## 2. Colour System

Dark-first. Light mode is out of scope for the MVP.

### 2.1 Core palette

| Token | Hex | Use |
|---|---|---|
| `abyss` | `#070B14` | App background |
| `deep` | `#0D1526` | Page sections, sidebars |
| `hull` | `#131D33` | Cards, panels |
| `hull-raised` | `#1B2846` | Hovered or raised cards, modals |
| `border` | `#2A3A5C` | Default borders, dividers |
| `gold` | `#F2B84B` | Primary accent, tokens, key actions |
| `gold-bright` | `#FFD97A` | Hover, glow, highlights |
| `ember` | `#FF5A3C` | Surge, hot demand, bounty |
| `tide` | `#3DA9FC` | Info, links, supply indicators |
| `sea-foam` | `#34D3A6` | Success, price drops, completed |
| `crimson` | `#E5484D` | Errors, destructive actions, rejected |
| `parchment` | `#EADBB8` | Poster surfaces (used sparingly) |
| `ink` | `#2A1D0E` | Text on parchment |

### 2.2 Text colours

| Token | Hex | Use |
|---|---|---|
| `text-primary` | `#F3EEDF` | Main text (warm off-white) |
| `text-secondary` | `#A9B4CC` | Secondary text, labels |
| `text-muted` | `#6F7C99` | Hints, disabled |
| `text-on-gold` | `#1A1204` | Text on gold buttons |

### 2.3 Semantic mapping

| Meaning | Colour | Where |
|---|---|---|
| Price rising / hot demand | `ember` | Price badge, flame icon, "Bounty surge" |
| Price falling / cool | `sea-foam` | Price badge with down arrow |
| Stable | `text-secondary` | Flat dash icon |
| Supply | `tide` | Supply bars and labels |
| Demand | `ember` | Demand bars and labels |
| Tokens / balance | `gold` | VCT amounts and icon |
| Escrow held | `tide` | Held balance in the Treasure Chest |

Never use colour alone to carry meaning: pair it with an icon or label (arrow, flame, text).

### 2.4 Contrast rules
- Body text on `hull` and `abyss` must meet **WCAG AA (4.5:1)**; `text-primary` and `text-secondary` do.
- `text-muted` is for non-essential hints only.
- Gold buttons use `text-on-gold`, not white.
- Parchment surfaces always use `ink` text.

## 3. Typography

| Role | Font | Fallback | Use |
|---|---|---|---|
| **Display** | Pirata One | `Georgia, serif` | Logo, hero, poster titles, section banners |
| **UI / body** | Inter | `system-ui, sans-serif` | Everything else |
| **Numbers** | JetBrains Mono | `ui-monospace, monospace` | Token amounts, prices, stats, ledger |

Load from Google Fonts with `display=swap`. Numbers use tabular figures so digits do not jump when prices change.

### 3.1 Type scale

| Style | Size / line height | Weight | Font | Use |
|---|---|---|---|---|
| `display-xl` | 56 / 60 | 400 | Pirata One | Landing hero |
| `display-lg` | 40 / 44 | 400 | Pirata One | Page titles, posters |
| `h1` | 28 / 34 | 600 | Inter | Section headers |
| `h2` | 22 / 28 | 600 | Inter | Card headers |
| `h3` | 18 / 24 | 600 | Inter | Sub-headers |
| `body` | 16 / 24 | 400 | Inter | Paragraphs |
| `body-sm` | 14 / 20 | 400 | Inter | Secondary text |
| `caption` | 12 / 16 | 500 | Inter | Labels, badges (uppercase, +0.06em tracking) |
| `price-xl` | 40 / 44 | 700 | JetBrains Mono | Hero price on skill page |
| `price-md` | 24 / 28 | 700 | JetBrains Mono | Price on cards |
| `mono-sm` | 14 / 20 | 500 | JetBrains Mono | Ledger rows, stats |

On mobile, scale `display-xl` to 40 and `display-lg` to 32.

### 3.2 Hierarchy rules
- Only **one** display-font heading per screen region.
- Prices are always monospace, always the largest number on their card.
- Keep line length to about 60–75 characters for long text.

## 4. Spacing, Layout and Shape

- **Base unit:** 4px. Use multiples: 4, 8, 12, 16, 24, 32, 48, 64.
- **Container:** max width 1200px, side padding 16px (mobile) / 32px (desktop).
- **Grid:** 12 columns desktop, 4 mobile; card grids use `auto-fill, minmax(280px, 1fr)` with 24px gaps.
- **Breakpoints:** `sm 640`, `md 768`, `lg 1024`, `xl 1280`.
- **Radius:** `sm 6px` (inputs, badges), `md 12px` (cards), `lg 20px` (modals), `full` (avatars, pills).
- **Elevation (dark-mode style, glow instead of heavy shadow):**
  - `e1`: `0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 12px rgba(0,0,0,0.35)`
  - `e2`: `0 8px 24px rgba(0,0,0,0.5)`
  - `glow-gold`: `0 0 0 1px rgba(242,184,75,0.5), 0 0 24px rgba(242,184,75,0.25)`
  - `glow-ember`: `0 0 0 1px rgba(255,90,60,0.5), 0 0 24px rgba(255,90,60,0.3)`

## 5. Tailwind Tokens (drop-in)

```js
// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#070B14", deep: "#0D1526", hull: "#131D33", "hull-raised": "#1B2846",
        line: "#2A3A5C",
        gold: { DEFAULT: "#F2B84B", bright: "#FFD97A" },
        ember: "#FF5A3C", tide: "#3DA9FC", foam: "#34D3A6", crimson: "#E5484D",
        parchment: "#EADBB8", ink: "#2A1D0E",
        text: { primary: "#F3EEDF", secondary: "#A9B4CC", muted: "#6F7C99", ongold: "#1A1204" },
      },
      fontFamily: {
        display: ["Pirata One", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: { sm: "6px", md: "12px", lg: "20px" },
      boxShadow: {
        e1: "0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 12px rgba(0,0,0,0.35)",
        e2: "0 8px 24px rgba(0,0,0,0.5)",
        "glow-gold": "0 0 0 1px rgba(242,184,75,0.5), 0 0 24px rgba(242,184,75,0.25)",
        "glow-ember": "0 0 0 1px rgba(255,90,60,0.5), 0 0 24px rgba(255,90,60,0.3)",
      },
    },
  },
};
```

Components use these tokens only. No one-off hex values (see `rules.md` B7).

## 6. Iconography and Imagery

- **Icon set:** Lucide (line icons, 1.75px stroke, 20px default, 24px in headers).
- **Custom icons (draw as inline SVG):** Vivre Card (small torn card with a flame edge), Log Pose (compass), Skull flag (Jolly Roger), Flame (surge).
- **Token symbol:** the Vivre Card icon in gold, always shown next to VCT amounts.
- **Skill category icons:** simple emoji or Lucide stand-ins are fine (Haki ⚡, Swords ⚔️, Karate 🥋, Navigation 🧭, Cooking 🍳, Devil Fruit 🍎, Shipwright ⚓).
- **Avatars:** initials on a gradient circle by default; provider posters can use stylised illustrated silhouettes.
- **Textures:** subtle paper-grain and sea-map line patterns as low-opacity CSS backgrounds (under 8% opacity). Keep files small (inline SVG or under 50 KB).
- **Art rule:** original, AI-generated-in-house or freely licensed artwork only. No official manga panels, logos or screenshots (`rules.md` B8.2).

## 7. Core Components

### 7.1 Buttons

| Variant | Style | Use |
|---|---|---|
| **Primary** | Gold fill, `text-ongold`, radius sm, hover `gold-bright` + `glow-gold` | Main actions: Send Vivre Card, Set Sail |
| **Secondary** | Transparent, 1px `line` border, `text-primary`, hover `hull-raised` | Secondary actions |
| **Danger** | Crimson outline, fills on hover | Reject, cancel |
| **Ghost** | No border, `text-secondary` | Tertiary, inline |

States: default, hover, focus (2px `gold` ring with 2px offset), active (scale 0.98), disabled (40% opacity), loading (spinner, label stays, width stays).
Height 44px (touch friendly), 36px for compact.

### 7.2 Inputs
- Background `deep`, 1px `line` border, radius sm, 44px height.
- Focus: `gold` border + soft gold ring. Error: `crimson` border + message below with icon.
- Labels above the field in `caption` style; helper text in `body-sm` `text-muted`.

### 7.3 Skill Card (Bounty Poster card)
The main browsing unit.

```
┌───────────────────────────────┐
│ ⚡ HAKI              ● HOT     │  category chip + demand badge
│                               │
│  Advanced Conqueror's Haki    │  h2
│  by Silvers Rayleigh · Legend │  body-sm + tier badge
│                               │
│  ★ 4.9 (38)      1 provider   │  rating + supply
│ ───────────────────────────── │
│  ▲ 508 VCT        +154%       │  price-md + trend
│  ▁▂▃▅▆█  (sparkline)          │  7-day price sparkline
│  [ View ]                     │
└───────────────────────────────┘
```

- Surface `hull`, border `line`, radius md, `e1`; hover lifts (translateY -2px) and shows `glow-gold`.
- **Hot** cards (multiplier above 1.5x) get a thin `ember` top border and a flame badge.
- **Rare Mastery** tag appears when supply is 1 and demand is high.
- Whole card is clickable; the button is a visual cue.

### 7.4 Price Badge (`PriceBadge`)
The most important component. Props: `price`, `basePrice`, `multiplier`, `trend`.

| State | Look |
|---|---|
| Surging (multiplier ≥ 1.5) | `ember` text, ▲ arrow, flame icon, `glow-ember` pulse once on change |
| Rising (1.1–1.49) | `ember` text, ▲ arrow |
| Stable (0.9–1.09) | `text-primary`, — dash |
| Falling (below 0.9) | `foam` text, ▼ arrow |

- Shows price in `price-md` with the VCT icon, and the change against base price as a percentage.
- On value change: digits roll or cross-fade over 300ms and the badge flashes its state colour.

### 7.5 "Why this price?" popover (`WhyThisPrice`)
Opens from an info icon next to any price.

```
Why 508 VCT?
Base price ............ 200
Providers available ...   1   (supply)
Recent demand .........  12   (weighted requests, 7 days)
Demand per provider ...  12
Multiplier ............ ×2.54
────────────────────────────
Price ................. 508 VCT
[ mini price-history chart ]
```

Mono digits, right-aligned values, `hull-raised` background, arrow anchored to the trigger.

### 7.6 Provider Card
Avatar (56px), name, tier badge, rating, sessions taught, next available slot, price, "Send Vivre Card" primary button. Compact horizontal layout in lists.

### 7.7 Tier Badge

| Tier | Colour | Icon |
|---|---|---|
| Rookie | `text-secondary` | Single skull |
| Supernova | `tide` | Star |
| Warlord | `gold` | Crown |
| Legend | `ember` gradient to gold | Flame crown |

### 7.8 Request Modal ("Send Vivre Card")
Radius lg, `hull-raised`, backdrop blur.
1. Provider and skill summary.
2. Slot picker (pill buttons; unavailable slots disabled and struck through).
3. Optional message field.
4. **Cost summary:** "Price locked at **508 VCT**", "Your balance **1,240 VCT**", "After hold **732 VCT**", note: "Held by Marine HQ until the lesson is complete. Refunded if rejected or expired."
5. Primary button "Send Vivre Card for 508 VCT" (disabled and inline error `INSUFFICIENT_TOKENS` if the balance is too low).

### 7.9 Ledger Table (Treasure Chest)
- Rows: date, type chip (Grant, Held, Released, Refund, Burned), description, amount (mono; `foam` for credits, `text-primary` for holds, `crimson` for spends).
- Sticky header, zebra rows using `deep` / `hull`, pagination below.
- Empty state shows an open empty chest illustration and "No treasure yet".

### 7.10 Status Chips (requests and sessions)

| Status | Colour | Label |
|---|---|---|
| PENDING | `gold` | Awaiting reply |
| ACCEPTED | `tide` | Accepted |
| COMPLETED | `foam` | Completed |
| REJECTED | `crimson` | Declined |
| EXPIRED | `text-muted` | Expired |
| CANCELLED | `text-muted` | Cancelled |

### 7.11 Rating Stars
Five stars, gold filled, hover preview, keyboard operable (arrow keys), visible label "4 of 5".

### 7.12 Charts (Recharts)
- **Price history:** line in `gold`, area fill gradient gold at 20% to 0%, base-price reference line dashed `text-muted`, tooltip with price, supply, demand.
- **Supply vs demand:** paired bars, supply `tide`, demand `ember`.
- Grid lines `line` at 40% opacity; axis labels `caption` in `text-muted`.
- Always include a text summary for screen readers ("Price rose from 200 to 508 over 7 days").

### 7.13 Feedback components
- **Toasts:** bottom-right (top on mobile), 4s, icon + message, colour-coded left border.
- **Skeletons:** shimmer blocks matching card shapes for loading.
- **Empty states:** icon, one line of copy, one action.
- **Error states:** crimson icon, plain-language message, retry button.

## 8. Screen Specifications

### 8.1 Landing
- Full-height hero over a night-ocean gradient with animated wave lines and floating parchment posters.
- Headline (display-xl): **"Trade your mastery on the Grand Line."**
- Subhead: lore hook about Rayleigh's Haki price surge.
- Live ticker strip underneath: "⚡ Conqueror's Haki ▲ 508 VCT · 🥋 Fish-Man Karate ▲ 130 VCT · 🍳 Black Leg Cooking ▼ 70 VCT".
- Primary CTA **Set Sail** (register), secondary **Browse the Market**.

### 8.2 Sabaody Market (home after login)
```
┌ Nav: Logo | Market | Requests | Sessions | Dashboard | 🪙 1,240 VCT | Avatar ┐
│ Hot right now  ▸ [poster][poster][poster]  (horizontal scroll, ember accents) │
│ ┌ Filters ─────┐  ┌ Results (grid of Skill Cards) ───────────────────────────┐ │
│ │ Search       │  │ Sort: Demand ▾                                           │ │
│ │ Category     │  │ [card][card][card]                                       │ │
│ │ Price range  │  │ [card][card][card]                                       │ │
│ │ Min rating   │  │                                                          │ │
│ │ Availability │  │                                                          │ │
│ │ Demand level │  │                                                          │ │
│ └──────────────┘  └──────────────────────────────────────────────────────────┘ │
```
Mobile: filters collapse into a bottom-sheet drawer opened from a "Filters" button.

### 8.3 Skill Detail
- Header: category chip, skill title (display-lg), lore blurb.
- Left (2/3): price history chart, supply vs demand bars, description.
- Right (1/3, sticky): hero price (`price-xl`) with `PriceBadge` and `WhyThisPrice`, supply and demand gauges, primary CTA.
- Below: provider list (Provider Cards) sorted by rating; reviews section.

### 8.4 Provider Profile
Wanted-poster style header on `parchment` with `ink` text: name as the "WANTED" title, tier as the bounty line, rating as a bounty-style figure. Below it, dark cards for listings and reviews.

### 8.5 Treasure Chest (wallet)
Three stat tiles: **Available**, **Held by Marine HQ**, **Earned all-time**. Ledger table below. Optional gold-coin count-up animation on load.

### 8.6 Requests Inbox and My Sessions
Two tabs (Sent, Received) with status chips. Received pending requests show Accept (primary) and Decline (danger) buttons inline. Sessions show a timeline: Requested → Accepted → Completed → Rated, with the current step highlighted.

### 8.7 Market Dashboard
Top movers table, per-skill supply/demand chart grid, "Hot right now" strip, live ticker. Refreshes every ~10s with a subtle pulse on changed numbers. Admin-only: **Simulate Pirate Rush** button (ember, with confirm).

## 9. Motion

| Element | Motion | Duration / easing |
|---|---|---|
| Card hover | Lift 2px + glow | 150ms ease-out |
| Price change | Digit roll or cross-fade, state-colour flash | 300ms ease-in-out |
| Surge badge | Single ember pulse on entering surge | 600ms, once |
| Modal | Fade + scale from 0.96 | 200ms ease-out |
| Page load | Staggered card fade-up (max 8 cards) | 40ms stagger, 250ms each |
| Token count-up | Numeric ease to final | 700ms ease-out |
| Landing waves | Slow parallax line drift | 20–30s loop, low opacity |

**Rules:** motion supports meaning (something changed), never decorates constantly. Respect `prefers-reduced-motion`: disable parallax, pulses and count-ups, keep simple fades.

## 10. Copy and Voice

Playful on labels, plain on anything involving tokens or errors.

| Situation | Copy |
|---|---|
| Primary request button | Send Vivre Card for {price} VCT |
| Request sent | Vivre Card sent. Your {price} VCT is held by Marine HQ. |
| Request accepted | {provider} accepted your request. Set sail! |
| Declined / expired | Request declined. {price} VCT returned to your chest. |
| Insufficient tokens | You need {n} more VCT. Teach a skill to earn more. |
| Session complete | Lesson complete. {price} VCT paid, 5% taxed by the World Government. |
| Empty market | No mastery here yet. Be the first to list a skill. |
| Generic error | Rough seas. Something went wrong. Try again. |
| Surge tooltip | Demand is outpacing teachers, so the price is climbing. |

## 11. Accessibility

- Contrast AA everywhere (section 2.4).
- Fully keyboard navigable with visible gold focus rings; logical tab order; modals trap focus and close with Esc.
- Semantic HTML (`button`, `nav`, `main`, headings in order); ARIA labels on icon buttons, charts and badges.
- Price changes announced politely (`aria-live="polite"`) on the skill page.
- Touch targets at least 44 x 44px.
- No information by colour alone; every colour state has an icon or text.
- Respect `prefers-reduced-motion`.

## 12. Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| Below 640 | Single-column cards, bottom tab navigation (Market, Requests, Sessions, Chest, Profile), filters in drawer, sticky bottom CTA on skill page |
| 640–1023 | Two-column card grid, top nav with condensed items |
| 1024 and above | Full layout with sidebar filters and sticky right rail on skill pages |

Tables become stacked cards on mobile. Charts keep a minimum height of 200px.

## 13. Implementation Notes

- Build shared primitives first (`Button`, `Input`, `Card`, `Badge`, `Modal`), then `PriceBadge`, `SkillCard`, `WhyThisPrice`.
- Keep the theme in `client/src/theme/` (tokens, SVG icons, animation utilities) so business code stays theme-neutral.
- Use CSS variables for the tokens too, so one change updates charts and components together.
- Provide a hidden `/styleguide` route that renders every component and state; it doubles as a design QA page and a demo backup.
- Keep images optimised and lazy-loaded; target a Lighthouse performance score of 85 or higher.

## 14. Design QA Checklist

- [ ] Only tokens from this file are used; no stray hex values.
- [ ] Every price uses monospace and the `PriceBadge` where a trend applies.
- [ ] Every page has loading, empty and error states.
- [ ] Token-spending actions show a confirmation with cost and balance.
- [ ] Focus rings visible; keyboard path works on Market → Skill → Request.
- [ ] Reduced-motion mode tested.
- [ ] Checked at 360px, 768px and 1280px widths.
- [ ] Rayleigh's Haki surge and an oversupplied falling-price skill look clearly different at a glance.
- [ ] No copied official artwork.

---
*Prepared for PS-05 — Peer-to-Peer Skill Marketplace with Demand-Based Pricing (One Piece theme). Keep in sync with `rules.md` (B7, B8) and `Task.md` (Phases 1, 3, 4).*
