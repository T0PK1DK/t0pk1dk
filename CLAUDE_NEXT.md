# Next design round — paste this to Claude

Copy everything under the line into a new Claude chat (or Claude Code) when you want the next visual pass.

---

You are working on **King's Toy Box** at `t0pk1dk.com` (repo: this site, Cloudflare Pages, static root, no build step). Read `README.md`, `HANDOFF.md`, and this file first. Then do a **design-forward** pass. Do not rewrite the site.

## What this site is

A soft, warm project-card hub. The homepage (`index.html` + `css/toybox.css` + `js/toybox.js`) is the product. Cards render from `data/projects.json`. Tapping a card opens a preview sheet. Live / in-progress cards have real `liveUrl`s; in-development cards have `liveUrl: null` and no invented link. Dark mode is first-class (`localStorage` key `toybox-theme`).

The older freelance pages (`/work/`, `/about/`, `/contact/`, `css/site.css`) still exist. Do not restyle them unless a Toy Box change breaks a shared link. Keep the homepage as the pretty shelf.

## What the last nine overnight passes already did

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

### Pass 7 (polish / edge cases) — stacked on the same PR

- **Image placeholders.** Card, What's new, and sheet thumbs keep the warm wash while the image loads, with a reduced-motion-safe shimmer. Images fade in when ready.
- **Empty search.** A centered empty sheet (existing copy) plus a “Clear search or filters” button. Escape in the search box clears the query. The empty panel scrolls under the sticky chips so the button is on screen at 390px.
- **Broken images.** Error handlers strip the AVIF `<source>` before swapping in `fallback.svg`. A second failure shows the bear mark. What's new thumbs now use the same loader/fallback as cards.
- **Keyboard / focus.** Skip focuses the search box. Header DOM matches the 390px visual order (brand, theme, nav). No-link sheets focus the Close preview button; live sheets still focus Open. Focus returns to the card that opened the sheet.
- **390px targets.** Footer links, skip, brand, Unlock, What's new rows, and sheet Close are 44px or taller. Status chips keep `min-height: 44px`.
- **Dark contrast.** Hairline `--line` bumped so chips/search/sheet chrome read on cocoa. Sheet close sits on a solid card fill. Coming-soon and empty panels use a stronger dashed edge. Body muted already passed AA; left the token.
- **No-link sheet.** Open stays hidden. Coming soon flag + dashed note stay. A full-width Close preview button is the action. Empty host/note lines are hidden.
- Cache-bust is `?v=17`. Tests were not weakened. Lockbox crypto was not touched.

### Pass 8 (missing hosts / perf / share cards / whole-site 390) — stacked on the same PR

- **Missing live hosts (top brief item).** Rechecked Terminal Trader, NOMI, Habla / Learn Spanish, Miami AI Weather, E-SEKAI, and Porch Market. Public GitHub repos exist for all except E-SEKAI. None have GitHub Pages. Habla's README still points at `https://t0pk1dk.github.io/learn-spanish/` and that URL still 404s. Terminal Trader's README still has `PLAY-LINK-PLACEHOLDER`. NOMI / Miami AI Weather / Porch Market READMEs have no public host. Lookalike `*.pages.dev` hosts that return 200 are **not King's** (Bulgarian Spanish lessons, a Russian Español app, Miami weather SEO spam, a Flutter `nomi`, a Paris video studio named Esekai). Did not add cards, GitHub chrome, or invented URLs. Iron Command and `workers.dev` stayed off the shelf.
- **Image sizes.** Each card now has 360w and 144w WebP + AVIF next to the 720w files. Shelf cards use `360w, 720w` srcset. What's new uses `144w, 360w` into the 64–72px slot instead of a full 720.
- **Layout shift / first paint.** Hero stats reserve `min-height` and ship the current `32 · 11 live · 11 in progress` counts in HTML so the first paint does not jump. Card pop animation runs only after a filter reshuffle, not on first paint. Only the first What's new thumb is eager.
- **Share cards.** Static `/p/<id>/` pages for every public project, with `og:` / Twitter tags and JSON-LD from the existing name, description, and preview. Homepage adds `twitter:title` / `twitter:image` / `og:image` size, CollectionPage JSON-LD, and `?p=<id>` to open that sheet. `sitemap.xml` lists the 32 share URLs. Work / About / Contact got the same style of tags from their existing titles and descriptions. Regenerator: `node scripts/write-share-pages.mjs` (not a required build step).
- **390px whole site.** Work filters, freelance footer links, and the freelance skip link are 44px. Cache-bust is `?v=19` on Toy Box CSS/JS and `?v=2` on `site.css`. Tests were not weakened. Lockbox crypto was not touched.

### Pass 9 (final review) — stacked on the same PR

- Re-read the stacked diff. Lockbox crypto is still labels / `aria-invalid` / focus only.
- Every `/p/<id>/` page: local hrefs, CSS, favicon, manifest, and 720/360/144 WebP+AVIF all 200. All 22 public `liveUrl`s still 200. Coming-soon share pages have no external Open. JSON-LD ids match `projects.json`.
- Opening a Lockbox card no longer writes `/p/undefined/` into the tab title or share tags. `validate.mjs` now requires each share page to carry its `liveUrl` (or no `target="_blank"` if there isn't one) and each id in the homepage list. Cache-bust is `?v=20`. No new cards. No invented URLs.

### Pass 10 (IRON COMMAND playable on t0pk1dk.com)

- **Playable host.** IRON COMMAND now lives at `https://t0pk1dk.com/iron-command/` — a static snapshot under `/iron-command/` in this repo (HTML + hashed JS/CSS). The private GitHub repo was not readable from this environment, so the playable files were copied in without touching any other project. **Do not** link a `workers.dev` host from the shelf, share pages, or public copy.
- **Card.** New `iron-command` entry in `data/projects.json` (`In progress`, same-site `liveUrl`). Share page, sitemap, homepage JSON-LD, and hero stats (`33 · 11 live · 12 in progress`) updated. Preview is a real hex-map screenshot in 720/360/144 WebP + AVIF.
- **Link recheck.** All previous public `liveUrl`s still return HTTP 200. Habla / Learn Spanish was left untouched (King hasn't decided). No invented hosts. Nabu and Launch Kit stay on GitHub.
- **Small fixes.** Same-site Open buttons say **Play** and stay in-tab. News rows lift on hover (fine pointers). Search is `spellcheck="false"`. Share-page actions go two-up from 520px. `/iron-command` pretty-URL redirect. Long-cache hashed game assets. Game page has a Toy Box back link, canonical, theme-color, and favicon.
- Cache-bust is `?v=21`. Tests were not weakened. Lockbox crypto was not touched.

### Pass 11 (soft-launch strip)

- **Featured section.** Homepage `#launch` strip under the hero: HILO, INVERT, SPRAIN as playable featured cards, Iron Command as a dashed coming-soon / **Playtest soon** tile. Existing shelf cards stay. Hash `#launch` / `#soft-launch` scrolls there. The strip hides while search or filters are on so the shelf stays the focus.
- **Links used (all already in this repo, none are `workers.dev`).** Game repos `T0PK1DK/HILO-game`, `T0PK1DK/INVERT`, `T0PK1DK/SPRAIN`, and `T0PK1DK/iron-command` were private / 404 from this environment — no new host was invented.
  - HILO → `https://hilo-game-dnh.pages.dev`
  - INVERT → `https://invert-game.pages.dev`
  - SPRAIN → `https://www.thebando.cc/games/sprain/`
  - Iron Command shelf / share page still uses `https://t0pk1dk.com/iron-command/`. The launch tile itself has **no outbound link** (Playtest soon). Tapping it still opens the preview sheet, which keeps the existing Play button.
- **Where to drop a later link.** If HILO or INVERT get a custom domain, swap `liveUrl` in `data/projects.json` and regenerate share pages. If Iron Command should stay unlinked on the shelf too, set `liveUrl: null` and `status: "In development"` (and drop `launchSoon` only when you want the featured tile to say Play). If a custom-domain playtest URL appears, put it on `liveUrl` and set `launchSoon: false`.
- **UI.** Warm wash, 2-up from 401px, 3-up from 900px with Iron Command as a full-width banner. Hover lift only on fine pointers. 44px Playtest chip at 390px. Focus rings use `--focus`. Copy is T0PK1DK / Nard Labs / King's Toy Box only.
- JSON flags: `launch: true` on the four games; `launchSoon: true` on Iron Command. Cache-bust is `?v=22`. Tests were not weakened. Lockbox crypto was not touched.

### Pass 12 (Iron Command playable in the strip)

- **Featured tile.** Iron Command is no longer the dashed **Playtest soon** banner. It is a normal launch card next to HILO, INVERT, and SPRAIN, with a **Play** chip. `launchSoon` was removed; `launch: true` stays. Shelf card, share page, and `liveUrl` were already `https://t0pk1dk.com/iron-command/`. **Do not** point the card at a `workers.dev` host.
- **Play links.** Clicking **Play** on a featured card goes to that game's `liveUrl`. Same-site Play (Iron Command) stays in-tab. Off-site Play (HILO, INVERT, SPRAIN) opens in a new tab. Tapping the rest of the card still opens the preview sheet.
- **Copy.** Hero and “On the table.” ledes now name all four playable games. Iron Command is not “next” or still in paint.
- **Layout.** 2-up from 401px, 2-up from 900px, 4-up from 1100px so the four Play cards sit as peers. The unused `launchSoon` banner styles remain in CSS for a later coming-soon tile.
- **Small fixes.** Cache-bust is `?v=23`. Featured Play chip is the outbound control (no invented URL). 44px Play chip at 390px still applies. Focus rings still use `--focus`. Public copy is T0PK1DK / Nard Labs / King's Toy Box only.
- Tests were not weakened. Lockbox crypto was not touched.

### Pass 13 (honest card dates / status — do not merge or deploy)

- **SPRAIN date.** Shelf card still said `2026-06-01`. The private `T0PK1DK/SPRAIN` repo is not readable here; the production `sprain` Worker (hosts `games.thebando.cc`, `thebando.cc`, `www.thebando.cc`) was last deployed from main on **2026-10-31**. `lastUpdated` is now `2026-10-31`.
- **SPRAIN link.** The card and share page pointed at `play.testdasite.com/play/game/` — that hostname is the `sprain-playtest` Worker, not production. Open / Play now goes to the approved live game, `https://games.thebando.cc/game/` (HTTP 200). No `workers.dev`.
- **SWEET-D.** The diner page title is “SWEET-D — In development” and the play path is a key-gated preview (`PREVIEW BUILD · KEY REQUIRED · NOT OPEN YET`). Card status is now `In development`, `liveUrl: null`, coming-soon note and no Open button — same polish as CONCLAVE & friends. Hero first-paint stats are `33 · 11 live · 11 in progress`.
- **Baller.** No card added. The only King-owned host found is a test Worker on `baller.testdasite.com`, which **404s**. `baller.pages.dev` returns 200 but is a Pages preview, not an approved live custom domain — do not use `pages.dev` for new entries. No `thebando.cc` / `t0pk1dk.com` production URL.
- **Link rule.** Hard rules now say the site links only to approved live builds; in-progress updates stay on separate preview links.
- Cache-bust unchanged (`?v=23` — CSS/JS not edited). Tests were not weakened. Lockbox crypto was not touched. **Do not merge or deploy from this pass.**

## Hard rules (do not break)

- **Do not remove any project** from `data/projects.json`.
- **Do not change Lockbox protection.** Leave `js/private-vault.js` decrypt (`PBKDF2` + `AES-GCM`), `sessionStorage` key, `data/private.enc.json`, and the encrypt scripts alone unless you are only touching labels / focus / layout around the form.
- **Never commit** `data/private.json`, the vault password, the numeric PIN, or King's legal name. Public copy is **T0PK1DK** / **Nard Labs** / **King's Toy Box** only. `npm test` scans for forbidden name fragments.
- **Do not invent URLs.** If a link is dead and you cannot confirm a replacement, leave `liveUrl` as-is or set it `null` and drop status to `In development` — never guess a host. IRON COMMAND's public URL is `https://t0pk1dk.com/iron-command/`. Do not list `workers.dev` links.
- **Approved live builds only.** The shelf, share pages, and featured Play chips link only to approved live production hosts that return HTTP 200. In-progress updates live on separate preview / playtest / `*.pages.dev` / `*.testdasite.com` links — never on the public card. No `pages.dev` for new entries. No `workers.dev`. No personal-account hostnames. If a project has no approved live URL, leave it off the shelf or keep `liveUrl: null` and `In development`.
- Additive only. No framework, no rewrite of the card renderer, no new build step. `npm test` / `npm run build` must stay green (`scripts/validate.mjs`). Do not weaken tests.
- Bump `?v=` on `/css/toybox.css` and `/js/toybox.js` (and lockbox JS if you touch it) when you edit them. Cache is 7 days. Card images cache-bust with `lastUpdated`.
- Keep the feeling: **soft, warm, uncluttered**, cream paper in light mode, cocoa dark mode. No neon, no dense dashboards, no stock-SaaS chrome.

## Design brief for this round

The soft-launch strip is on the homepage. What is still open is **custom-domain hosts** and **missing live pages**.

Ideas, pick a few — do not do all of them:

1. **Swap HILO / INVERT off `pages.dev` the moment a custom domain exists.** Do not invent one. Leave the current Pages hosts until then. Never add a `workers.dev` link. New cards must already have an approved live host.
2. **IRON COMMAND.** Refresh `/iron-command/` from a newer static build when the game ships an update. Keep the public URL on `t0pk1dk.com`. Recapture the card shot after the hex field is visible (skip the tutorial overlay). Do not point the featured tile at a workers host.
3. **Find live pages, do not invent them.** If Terminal Trader, NOMI, Habla / Learn Spanish, Miami AI Weather, E-SEKAI, or Porch Market get a real public host, add or update the card and recapture a screenshot. Habla's README still points at a GitHub Pages URL that 404s — leave that link as-is until King decides. Do not use lookalike `pages.dev` hosts that are not King's.
4. **GitHub cards.** Nabu and Launch Kit still show github.com chrome. Recapture only if a Pages demo ships.
5. **Coming-soon art** is designed key art. If a real public screenshot or repo image appears, swap it in and encode 144, 360, and 720 WebP + AVIF. Do not invent blurbs for CONCLAVE, Dominous, E-SEKAI, EUTS, LAJAN, MiCasa, SNAGGIT, or TAPN until a README or live page exists.
6. **Invert.** Play is drawn on a canvas. If you recapture, click the canvas Play control — a DOM button locator will miss.
7. **Type.** System rounded is fine. No render-blocking Google Fonts on the homepage.

## Done means

- `npm test` passes. Do not weaken tests.
- Phone (~390px) and desktop (~1280px) screenshots of the homepage in **light and dark**, including the launch strip and What's new.
- Push to the open PR if one is already waiting (do not open a second PR for the same shelf pass).
- Update this file with what you shipped and a fresh ready-to-paste prompt for the round after you.

If you only have time for one thing: **wire a live URL the moment one of the missing public projects actually ships — on an approved production host, never a preview.** Leave the lockbox locked.
