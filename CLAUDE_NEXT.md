# Next design round — paste this to Claude

Copy everything under the line into a new Claude chat (or Claude Code) when you want the next visual pass.

---

You are working on **King's Toy Box** at `t0pk1dk.com` (repo: this site, Cloudflare Pages, static root, no build step). Read `README.md`, `HANDOFF.md`, and this file first. Then do a **design-forward** pass. Do not rewrite the site.

## What this site is

A soft, warm project-card hub. The homepage (`index.html` + `css/toybox.css` + `js/toybox.js`) is the product. Cards render from `data/projects.json`. Tapping a card opens a preview sheet. Live / in-progress cards have real `liveUrl`s; in-development cards have `liveUrl: null` and no invented link. Dark mode is first-class (`localStorage` key `toybox-theme`).

The older freelance pages (`/work/`, `/about/`, `/contact/`, `css/site.css`) still exist. Do not restyle them unless a Toy Box change breaks a shared link. Keep the homepage as the pretty shelf.

## What the last six overnight passes already did

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

### Pass 4 (coming-soon art / search / status / 390px)

- Ten In-development cards have labeled coming-soon key art. Sheets have no Open button.
- Search, status chips, Recently updated / Newest sort.

### Pass 5 (perf / a11y / what's new)

- **AVIF + WebP** `<picture>` on cards, What's new thumbs, and the preview sheet. First two shelf cards eager; the rest `loading="lazy"`. Dropped unused image preloads. First paint no longer snaps the shelf over What's new. Cache-bust is `?v=16`.
- **Alt text** on preview sheets (`Screenshot of…` / `Coming soon art for…`). Card and What's new thumbs are decorative (`alt=""`) so the button’s visible name stays the accessible name. Keyboard `:focus-visible` rings use `--focus` (#c45a28 light / #f29a63 dark) on cards, chips, news items, brand, skip, inputs, and buttons.
- **Contrast.** Light muted `#7a5c4e`, accent text `#9a3f18`, live dates `#1e7a4e` so body copy and the eyebrow pass WCAG AA. Decorative orange on buttons stays `--accent`.
- **What's new** strip under the hero: the 3 most recently updated public projects (stable date sort — BEEP, Chamber Arcade, Cluck Life). Hash `#new`. Compact rows at 390px.
- `validate.mjs` also warns when an AVIF is missing. Tests were not weakened. Lockbox crypto was not touched.

### Pass 6 (live URL recheck / stale previews / sourced blurbs) — stacked on the same PR

- Re-checked all **22** public `liveUrl`s. Every one still returns HTTP 200. Did not add Iron Command, `workers.dev`, or private hosts. Nabu and Launch Kit stay on GitHub (no Pages demo). Coming-soon cards still have no public README or live page — no invented screenshots or copy.
- Recaptured stale 720×450 WebP + AVIF previews from the live page (overlays dismissed so the card shows the product):
  - Chamber Arcade — full Fair / Classic / VS HOUSE table
  - Cluck Life — farm plus train panel
  - BEEP — desk pad (not the tour tooltip crop)
  - Slide — HUD after dismissing sign-in
  - RDF — roster after Skip
  - BAY 9 — Career control on the strip
  - Terra — living shelf after Begin
  - Stellar Evolution — live world after Begin
  - HILO — current HI-LO trainer home (not a higher-or-lower table)
- Invert Play is canvas-drawn and the stored gameplay shot still matches; left it. Sweet-D, SHOTBYZB, ZONEZ, GRINDEX, Midas, BuzzahhJitt, Bando Games, Respawn, and GitHub chrome were current enough to keep.
- Added or corrected 1–2 line "what it is" blurbs from the live page, repo README, or `/work/` only. HILO was wrong (it is a HI-LO card-counting trainer). Midas names the guide/workbook and says the web app is still coming. Coming-soon cards without a public source were left as-is. The WALL now uses the `/work/` line.
- `lastUpdated` bumped only on recaptured images for cache-bust. What's new stays BEEP, Chamber Arcade, Cluck Life (same 2026-10-22 date, JSON order). 390px rules untouched. `?v=` still 16 (CSS/JS not edited). Tests were not weakened. Lockbox crypto was not touched.

## Hard rules (do not break)

- **Do not remove any project** from `data/projects.json`.
- **Do not change Lockbox protection.** Leave `js/private-vault.js` decrypt (`PBKDF2` + `AES-GCM`), `sessionStorage` key, `data/private.enc.json`, and the encrypt scripts alone unless you are only touching labels / focus / layout around the form.
- **Never commit** `data/private.json`, the vault password, the numeric PIN, or King's legal name. Public copy is **T0PK1DK** / **King's Toy Box** only. `npm test` scans for forbidden name fragments.
- **Do not invent URLs.** If a link is dead and you cannot confirm a replacement, leave `liveUrl` as-is or set it `null` and drop status to `In development` — never guess a host. Do not list Iron Command. Do not list `workers.dev` links.
- Additive only. No framework, no rewrite of the card renderer, no new build step. `npm test` / `npm run build` must stay green (`scripts/validate.mjs`). Do not weaken tests.
- Bump `?v=` on `/css/toybox.css` and `/js/toybox.js` (and lockbox JS if you touch it) when you edit them. Cache is 7 days. Card images cache-bust with `lastUpdated`.
- Keep the feeling: **soft, warm, uncluttered**, cream paper in light mode, cocoa dark mode. No neon, no dense dashboards, no stock-SaaS chrome.

## Design brief for this round

Live URLs and blurbs were just rechecked. What is still open is **missing live hosts**.

Ideas, pick a few — do not do all of them:

1. **Find live pages, do not invent them.** If Terminal Trader, NOMI, Habla / Learn Spanish, Miami AI Weather, E-SEKAI, or Porch Market get a real public host, add or update the card and recapture a screenshot. Habla's README still points at a GitHub Pages URL that 404s.
2. **GitHub cards.** Nabu and Launch Kit still show github.com chrome. Recapture only if a Pages demo ships.
3. **Coming-soon art** is designed key art. If a real public screenshot or repo image appears, swap it in and encode both AVIF and WebP. Do not invent blurbs for CONCLAVE, Dominous, E-SEKAI, EUTS, LAJAN, MiCasa, SNAGGIT, or TAPN until a README or live page exists.
4. **Invert.** Play is drawn on a canvas. If you recapture, click the canvas Play control — a DOM button locator will miss.
5. **Type.** System rounded is fine. No render-blocking Google Fonts on the homepage.

## Done means

- `npm test` passes. Do not weaken tests.
- Phone (~390px) and desktop (~1280px) screenshots of the homepage in **light and dark**, including What's new.
- Push to the open PR if one is already waiting (do not open a second PR for the same shelf pass).
- Update this file with what you shipped and a fresh ready-to-paste prompt for the round after you.

If you only have time for one thing: **wire a live URL the moment one of the missing public projects actually ships.** Leave the lockbox locked.
