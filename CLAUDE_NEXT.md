# Next design round — paste this to Claude

Copy everything under the line into a new Claude chat (or Claude Code) when you want the next visual pass.

---

You are working on **King's Toy Box** at `t0pk1dk.com` (repo: this site, Cloudflare Pages, static root, no build step). Read `README.md`, `HANDOFF.md`, and this file first. Then do a **design-forward** pass. Do not rewrite the site.

## What this site is

A soft, warm project-card hub. The homepage (`index.html` + `css/toybox.css` + `js/toybox.js`) is the product. Cards render from `data/projects.json`. Tapping a card opens a preview sheet. Live / in-progress cards have real `liveUrl`s; in-development cards have `liveUrl: null` and no invented link. Dark mode is first-class (`localStorage` key `toybox-theme`).

The older freelance pages (`/work/`, `/about/`, `/contact/`, `css/site.css`) still exist. Do not restyle them unless a Toy Box change breaks a shared link. Keep the homepage as the pretty shelf.

## What the last overnight pass already did

Do not redo this work. Build on it.

- Work / About / Contact are reachable on phones (header wraps; footer has the same links). They used to vanish under 560px.
- Card blurbs stay visible on phones. Two-column grid from 401–720px; one column under 400px.
- Hover lift only on fine pointers so taps don’t stick. Focus-visible lift + image zoom. Images fade in and fall back to `assets/previews/fallback.svg` if a preview 404s.
- Skip link, 44px tap targets, filter count announced in a live region, sheet restores focus to the card that opened it, theme-color updates with dark mode.
- First six card images load eager; CSS + `projects.json` + the first two previews are preloaded. Cache-bust is `?v=6` on toybox CSS and `?v=7` on `toybox.js`.
- Changing a filter chip scrolls the shelf back into view if you were halfway down the page (so Games no longer drops you on the Lockbox).
- Lockbox: label is a real `.sr-only`, wrong passcode sets `aria-invalid`, Lock button is focused after unlock. **Crypto is unchanged.**
- HILO card copy now says it is playable in the browser (Android app still coming). All 19 public `liveUrl`s were 200 when last checked.
- Hash shortcuts: `#games`, `#sites`, `#tools`, `#recent`, `#lockbox`.

## Hard rules (do not break)

- **Do not remove any project** from `data/projects.json`.
- **Do not change Lockbox protection.** Leave `js/private-vault.js` decrypt (`PBKDF2` + `AES-GCM`), `sessionStorage` key, `data/private.enc.json`, and the encrypt scripts alone unless you are only touching labels / focus / layout around the form.
- **Never commit** `data/private.json`, the vault password, the numeric PIN, or King's legal name. Public copy is **T0PK1DK** / **King's Toy Box** only. `npm test` scans for forbidden name fragments.
- **Do not invent URLs.** If a link is dead and you cannot confirm a replacement, leave `liveUrl` as-is or set it `null` and drop status to `In development` — never guess a host.
- Additive only. No framework, no rewrite of the card renderer, no new build step. `npm test` / `npm run build` must stay green (`scripts/validate.mjs`).
- Bump `?v=` on `/css/toybox.css` and `/js/toybox.js` (and lockbox JS if you touch it) when you edit them. Cache is 7 days.
- Keep the feeling: **soft, warm, uncluttered**, cream paper in light mode, cocoa dark mode. No neon, no dense dashboards, no stock-SaaS chrome.

## Design brief for this round

Make the shelf feel more like a toy box and less like a grid of screenshots. Stay quiet.

Ideas, pick a few — do not do all of them:

1. **Preview quality.** Several `assets/previews/<id>.webp` still look like generic captures or early builds (Stellar Evolution, Launch Kit / GitHub cards, older “Live now.” notes). Recapture only if you can open the live URL and crop a 720px-wide webp. Missing shots already fall back. Do not add stock photos.
2. **In-development cards.** Initials on the peach/rose gradient are honest but samey. A quieter empty-shelf treatment (same gradient, smaller type, no fake screenshot) would help them sit next to live cards without looking broken.
3. **Sheet.** The preview dialog works. It could feel more like a physical card pulled off the shelf: slightly warmer radius, a clearer “still being built” state, maybe a swipe-down hint on phones. Keep it one card, one action.
4. **Type and voice.** System rounded is fine. If you add a font, it must be local or a single system stack — no render-blocking Google Fonts on the homepage. Card titles could use a hair more weight; the hero can stay short.
5. **Recently updated.** The chip sorts newest first. Dates like `2026-06-01` are placeholders — do not invent fresher dates. If you add an Updates strip, keep it to five honest notes already in `updateNote`.
6. **Motion.** Stagger + lift is enough. If you add anything, respect `prefers-reduced-motion` (already kills animation/transition). No particle backgrounds.
7. **Dark mode polish.** Check badge contrast on bright screenshots, sticky chip bar over scrolling cards, and the sheet backdrop. Theme toggle should stay a single icon button.

## Done means

- `npm test` passes.
- Phone (~390px) and desktop (~1280px) screenshots of the homepage in **light and dark**.
- A PR with a plain-English list of what changed (and what you left alone).
- Update this file (`CLAUDE_NEXT.md`) with what you shipped and what is still open, plus a fresh ready-to-paste prompt for the round after you.

If you only have time for one thing: **better in-development card empty state + a warmer preview sheet on phones.** Leave the lockbox locked.
