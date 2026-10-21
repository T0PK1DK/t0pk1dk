# Next design round — paste this to Claude

Copy everything under the line into a new Claude chat (or Claude Code) when you want the next visual pass.

---

You are working on **King's Toy Box** at `t0pk1dk.com` (repo: this site, Cloudflare Pages, static root, no build step). Read `README.md`, `HANDOFF.md`, and this file first. Then do a **design-forward** pass. Do not rewrite the site.

## What this site is

A soft, warm project-card hub. The homepage (`index.html` + `css/toybox.css` + `js/toybox.js`) is the product. Cards render from `data/projects.json`. Tapping a card opens a preview sheet. Live / in-progress cards have real `liveUrl`s; in-development cards have `liveUrl: null` and no invented link. Dark mode is first-class (`localStorage` key `toybox-theme`).

The older freelance pages (`/work/`, `/about/`, `/contact/`, `css/site.css`) still exist. Do not restyle them unless a Toy Box change breaks a shared link. Keep the homepage as the pretty shelf.

## What the last two overnight passes already did

Do not redo this work. Build on it.

### Pass 1 (mobile / a11y / nav)

- Work / About / Contact are reachable on phones (header wraps; footer has the same links).
- Card blurbs stay visible on phones. Two-column grid from 401–720px; one column under 400px.
- Hover lift only on fine pointers. Skip link, 44px targets, filter count announced, sheet restores focus, theme-color follows dark mode.
- Filter chips snap the shelf back into view if you were scrolled down.
- Hash shortcuts: `#games`, `#sites`, `#tools`, `#recent`, `#lockbox`.
- Lockbox labels / `aria-invalid` only. **Crypto is unchanged.**

### Pass 2 (cards / copy / speed) — stacked on the same PR

- Card motion: capped stagger (first 8), warmer hover lift + border, image zoom, light fade on the thumb.
- In-development thumbs are initials + a quiet **Soon** label, not giant type.
- Preview sheet: grabber on phones, stronger backdrop blur, slightly warmer radius.
- Recaptured **BEEP** (was almost black; now the pad) and **RDF** (roster with Kit / Ren / Bayan / Jae-Min). Other 17 previews were already honest 720×450 shots of the live pages. Nabu and Launch Kit still show their GitHub repos because that is the `liveUrl`.
- Copy fixes from the live sites: GRINDEX is Roblox codes (not “on the web”), Respawn HQ is a news desk (not “ops”), ZONEZ is community/chat (not “zone puzzles”), Bando Games / SWEET-D / BEEP match what the pages actually say. Dates were not invented except BEEP + RDF `lastUpdated` to today so the new webps bust the 7-day asset cache.
- Speed: preload CSS, JS, `projects.json`, and the first three previews; `sizes` on card images; `content-visibility` with a taller intrinsic size.
- Cache-bust is `?v=8` on toybox CSS/JS.

## Hard rules (do not break)

- **Do not remove any project** from `data/projects.json`.
- **Do not change Lockbox protection.** Leave `js/private-vault.js` decrypt (`PBKDF2` + `AES-GCM`), `sessionStorage` key, `data/private.enc.json`, and the encrypt scripts alone unless you are only touching labels / focus / layout around the form.
- **Never commit** `data/private.json`, the vault password, the numeric PIN, or King's legal name. Public copy is **T0PK1DK** / **King's Toy Box** only. `npm test` scans for forbidden name fragments.
- **Do not invent URLs.** If a link is dead and you cannot confirm a replacement, leave `liveUrl` as-is or set it `null` and drop status to `In development` — never guess a host.
- Additive only. No framework, no rewrite of the card renderer, no new build step. `npm test` / `npm run build` must stay green (`scripts/validate.mjs`).
- Bump `?v=` on `/css/toybox.css` and `/js/toybox.js` (and lockbox JS if you touch it) when you edit them. Cache is 7 days. Card images cache-bust with `lastUpdated`.
- Keep the feeling: **soft, warm, uncluttered**, cream paper in light mode, cocoa dark mode. No neon, no dense dashboards, no stock-SaaS chrome.

## Design brief for this round

The shelf is cleaner. What is still open is **preview honesty** and a little more toy-box, a little less screenshot grid.

Ideas, pick a few — do not do all of them:

1. **BEEP is a dark UI.** The pad crop is readable; the rest of the product is still near-black. A tighter crop of just the pad card (or a lit theme if the site has one) would help the shelf.
2. **GitHub cards.** Nabu and Launch Kit show github.com chrome. If either gains a Pages demo, recapture that. Do not invent a host.
3. **Stellar Evolution / RDF / ZONEZ** are menu or login shots. Recapture gameplay or an inside view only if you can click there and the URL stays public.
4. **In-development empty state.** Initials + Soon is quieter than before. A tiny per-card tint (still the same peach/rose family) would stop ten cards looking identical. No fake screenshots.
5. **Updates strip.** Five honest `updateNote`s, newest first. Do not invent dates. Many cards still say `2026-06-01`.
6. **Type.** System rounded is fine. No render-blocking Google Fonts on the homepage.
7. **Motion.** Stagger + lift is enough. Respect `prefers-reduced-motion`. No particles.

## Done means

- `npm test` passes.
- Phone (~390px) and desktop (~1280px) screenshots of the homepage in **light and dark**.
- Push to the open PR if one is already waiting (do not open a second PR for the same shelf pass).
- Update this file with what you shipped and a fresh ready-to-paste prompt for the round after you.

If you only have time for one thing: **tighter BEEP crop + a little color variety on Soon cards.** Leave the lockbox locked.
