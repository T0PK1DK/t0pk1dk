# Next design round — paste this to Claude

Copy everything under the line into a new Claude chat (or Claude Code) when you want the next visual pass.

---

You are working on **King's Toy Box** at `t0pk1dk.com` (repo: this site, Cloudflare Pages, static root, no build step). Read `README.md`, `HANDOFF.md`, and this file first. Then do a **design-forward** pass. Do not rewrite the site.

## What this site is

A soft, warm project-card hub. The homepage (`index.html` + `css/toybox.css` + `js/toybox.js`) is the product. Cards render from `data/projects.json`. Tapping a card opens a preview sheet. Live / in-progress cards have real `liveUrl`s; in-development cards have `liveUrl: null` and no invented link. Dark mode is first-class (`localStorage` key `toybox-theme`).

The older freelance pages (`/work/`, `/about/`, `/contact/`, `css/site.css`) still exist. Do not restyle them unless a Toy Box change breaks a shared link. Keep the homepage as the pretty shelf.

## What the last four overnight passes already did

Do not redo this work. Build on it.

### Pass 1 (mobile / a11y / nav)

- Work / About / Contact are reachable on phones. Two-column grid from 401–720px; one column under 400px.
- Hover lift only on fine pointers. Skip link, 44px targets, filter count announced, sheet restores focus.
- Hash shortcuts: `#games`, `#sites`, `#tools`, `#recent`, `#lockbox`.
- Lockbox labels / `aria-invalid` only. **Crypto is unchanged.**

### Pass 2 (cards / copy / speed)

- Capped stagger, warmer hover, honest copy, RDF recapture, preloads.

### Pass 3 (motion / night / newer public cards)

- Hover/tap, view transitions, cocoa night (`#17110e`).
- Added Chamber Arcade, Cluck Life, Slide with live-page webps. Stellar → `stellar.testdasite.com`. BEEP recaptured.
- Did not add Iron Command, `workers.dev`, or invented hosts.

### Pass 4 (coming-soon art / search / status / 390px) — stacked on the same PR

- All ten In-development cards now have honest **coming-soon key art** (720×450 webp), not empty initials and not fake gameplay. No public repo or live page exists for those ten; the art is labeled Coming soon. Preview sheets show the art plus a Coming soon flag. No invented URLs.
- **Search** the shelf. **Status chips** (Live / In progress / Coming soon) stack with kind filters. **Recently updated** is a sort toggle (newest first), not a separate shelf. Hashes: `#live`, `#progress`, `#soon`, `#recent`.
- **390px spacing:** tighter hero, 14px gutters, 10px card gap, compact search + chip bar, smaller lockbox padding.
- Cache-bust is `?v=11` on toybox CSS and JS.

## Hard rules (do not break)

- **Do not remove any project** from `data/projects.json`.
- **Do not change Lockbox protection.** Leave `js/private-vault.js` decrypt (`PBKDF2` + `AES-GCM`), `sessionStorage` key, `data/private.enc.json`, and the encrypt scripts alone unless you are only touching labels / focus / layout around the form.
- **Never commit** `data/private.json`, the vault password, the numeric PIN, or King's legal name. Public copy is **T0PK1DK** / **King's Toy Box** only. `npm test` scans for forbidden name fragments.
- **Do not invent URLs.** If a link is dead and you cannot confirm a replacement, leave `liveUrl` as-is or set it `null` and drop status to `In development` — never guess a host. Do not list Iron Command. Do not list `workers.dev` links.
- Additive only. No framework, no rewrite of the card renderer, no new build step. `npm test` / `npm run build` must stay green (`scripts/validate.mjs`). Do not weaken tests.
- Bump `?v=` on `/css/toybox.css` and `/js/toybox.js` (and lockbox JS if you touch it) when you edit them. Cache is 7 days. Card images cache-bust with `lastUpdated`.
- Keep the feeling: **soft, warm, uncluttered**, cream paper in light mode, cocoa dark mode. No neon, no dense dashboards, no stock-SaaS chrome.

## Design brief for this round

The shelf searches and the Soon cards have art. What is still open is **missing live hosts**.

Ideas, pick a few — do not do all of them:

1. **Find live pages, do not invent them.** If Terminal Trader, NOMI, Habla / Learn Spanish, Miami AI Weather, E-SEKAI, or Porch Market get a real public host, add or update the card and recapture a screenshot. Habla's README still points at a GitHub Pages URL that 404s.
2. **GitHub cards.** Nabu and Launch Kit still show github.com chrome. Recapture only if a Pages demo ships.
3. **Coming-soon art** is designed key art. If a real public screenshot or repo image appears, swap it in.
4. **Updates strip.** Five honest `updateNote`s, newest first. Do not invent dates.
5. **Type.** System rounded is fine. No render-blocking Google Fonts on the homepage.

## Done means

- `npm test` passes. Do not weaken tests.
- Phone (~390px) and desktop (~1280px) screenshots of the homepage in **light and dark**.
- Push to the open PR if one is already waiting (do not open a second PR for the same shelf pass).
- Update this file with what you shipped and a fresh ready-to-paste prompt for the round after you.

If you only have time for one thing: **wire a live URL the moment one of the missing public projects actually ships.** Leave the lockbox locked.
