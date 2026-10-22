# Next design round — paste this to Claude

Copy everything under the line into a new Claude chat (or Claude Code) when you want the next visual pass.

---

You are working on **King's Toy Box** at `t0pk1dk.com` (repo: this site, Cloudflare Pages, static root, no build step). Read `README.md`, `HANDOFF.md`, and this file first. Then do a **design-forward** pass. Do not rewrite the site.

## What this site is

A soft, warm project-card hub. The homepage (`index.html` + `css/toybox.css` + `js/toybox.js`) is the product. Cards render from `data/projects.json`. Tapping a card opens a preview sheet. Live / in-progress cards have real `liveUrl`s; in-development cards have `liveUrl: null` and no invented link. Dark mode is first-class (`localStorage` key `toybox-theme`).

The older freelance pages (`/work/`, `/about/`, `/contact/`, `css/site.css`) still exist. Do not restyle them unless a Toy Box change breaks a shared link. Keep the homepage as the pretty shelf.

## What the last three overnight passes already did

Do not redo this work. Build on it.

### Pass 1 (mobile / a11y / nav)

- Work / About / Contact are reachable on phones (header wraps; footer has the same links).
- Card blurbs stay visible on phones. Two-column grid from 401–720px; one column under 400px.
- Hover lift only on fine pointers. Skip link, 44px targets, filter count announced, sheet restores focus, theme-color follows dark mode.
- Filter chips snap the shelf back into view if you were scrolled down.
- Hash shortcuts: `#games`, `#sites`, `#tools`, `#recent`, `#lockbox`.
- Lockbox labels / `aria-invalid` only. **Crypto is unchanged.**

### Pass 2 (cards / copy / speed)

- Card motion: capped stagger (first 8), warmer hover lift + border, image zoom, light fade on the thumb.
- In-development thumbs are initials + a quiet **Soon** label, not giant type.
- Recaptured **BEEP** and **RDF**. Copy fixes from live sites (GRINDEX, Respawn HQ, ZONEZ, Bando Games, SWEET-D, BEEP).
- Speed: preload CSS/JS/`projects.json`/first three previews; `sizes` on card images; `content-visibility`.

### Pass 3 (motion / night / newer public cards) — stacked on the same PR

- Motion: stronger hover (`translateY(-6px) scale(1.012)`), tap (`scale(.97)`), View Transitions on theme flip and filter paint, `@view-transition { navigation: auto }` on Toy Box and the older pages. `prefers-reduced-motion` still wins.
- Night mode is warmer cocoa (`#17110e` paper, cream ink). Theme-color meta follows it.
- Soon cards get a quiet peach/rose tint (`data-tint` 0–3) so ten empties do not look identical. No fake screenshots.
- Recaptured **BEEP** (pad crop) and **Stellar Evolution** (live world after Begin). Stellar's public URL is now `stellar.testdasite.com` (same playable page, dedicated host).
- Added public cards that have a working live page: **Chamber Arcade** (`chamber-arcade.pages.dev`), **Cluck Life** (`cluck-life.pages.dev`), **Slide** (`kings-slide.pages.dev`). Honest 720×450 webps from those pages.
- Visited every older `liveUrl`. All 19 previous public links still 200. Nabu stays GitHub — the tablet is local, no public host. Launch Kit stays GitHub.
- **Did not add** Iron Command (going private). **Did not add** any `workers.dev` host. **Did not invent** links for E-SEKAI, Terminal Trader, NOMI, Learn Spanish / Habla, Miami AI Weather, or Porch Market — no working public page found that is actually those products. `*.pages.dev` names that belong to other people were not used.
- Cache-bust is `?v=10` on toybox CSS and JS.

## Hard rules (do not break)

- **Do not remove any project** from `data/projects.json`.
- **Do not change Lockbox protection.** Leave `js/private-vault.js` decrypt (`PBKDF2` + `AES-GCM`), `sessionStorage` key, `data/private.enc.json`, and the encrypt scripts alone unless you are only touching labels / focus / layout around the form.
- **Never commit** `data/private.json`, the vault password, the numeric PIN, or King's legal name. Public copy is **T0PK1DK** / **King's Toy Box** only. `npm test` scans for forbidden name fragments.
- **Do not invent URLs.** If a link is dead and you cannot confirm a replacement, leave `liveUrl` as-is or set it `null` and drop status to `In development` — never guess a host. Do not list Iron Command. Do not list `workers.dev` links.
- Additive only. No framework, no rewrite of the card renderer, no new build step. `npm test` / `npm run build` must stay green (`scripts/validate.mjs`).
- Bump `?v=` on `/css/toybox.css` and `/js/toybox.js` (and lockbox JS if you touch it) when you edit them. Cache is 7 days. Card images cache-bust with `lastUpdated`.
- Keep the feeling: **soft, warm, uncluttered**, cream paper in light mode, cocoa dark mode. No neon, no dense dashboards, no stock-SaaS chrome.

## Design brief for this round

The shelf now has the newer public games. What is still open is **missing live hosts** and a little more toy-box.

Ideas, pick a few — do not do all of them:

1. **Find live pages, do not invent them.** If Terminal Trader, NOMI, Habla / Learn Spanish, Miami AI Weather, E-SEKAI, or Porch Market get a real public host, add or update the card and recapture a screenshot. Habla's README still points at a GitHub Pages URL that 404s.
2. **GitHub cards.** Nabu and Launch Kit still show github.com chrome. Recapture only if a Pages demo ships.
3. **Slide** is a dark map HUD. If a brighter route view is one tap away and stays public, recapture that.
4. **Updates strip.** Five honest `updateNote`s, newest first. Do not invent dates. Many cards still say `2026-06-01`.
5. **Type.** System rounded is fine. No render-blocking Google Fonts on the homepage.
6. **Motion is enough.** Hover, tap, and view transitions already ship. Respect `prefers-reduced-motion`. No particles.

## Done means

- `npm test` passes.
- Phone (~390px) and desktop (~1280px) screenshots of the homepage in **light and dark**.
- Push to the open PR if one is already waiting (do not open a second PR for the same shelf pass).
- Update this file with what you shipped and a fresh ready-to-paste prompt for the round after you.

If you only have time for one thing: **wire a live URL the moment one of the missing public projects actually ships.** Leave the lockbox locked.
