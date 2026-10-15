# King's Toy Box (v3, Oct 2026)

- Cards: `data/projects.json`. Fields: id, name, description, category (`game`|`site`|`tool`), status (`Live`|`In progress`|`Android app`|`In development`), liveUrl (https or null; `In development` = no link, Live/In progress need a link), lastUpdated, updateNote.
- Preview screenshots: `assets/previews/<id>.webp` (720px wide). Missing ones fall back to `assets/previews/fallback.svg`.
- Lockbox: edit gitignored `data/private.json` (`{projects:[{title,url,kind,note}]}`), then `PRIVATE_PASSWORD=... npm run encrypt-private && npm test`. Never commit the plaintext or passcode.
- UI: `index.html`, `css/toybox.css`, `js/toybox.js`, `js/private-vault.js`. Bump `?v=` on CSS/JS when editing (7-day cache).

---
(older notes below)

# King's Toy Box — handoff for bots and humans

The homepage (`/`) is **King's Toy Box**: a shelf of projects rendered from one data file. Cloudflare Pages deploy is unchanged (static root, no build step in CI — run `npm test` locally).

## Project list: `data/projects.json`

Each object in `projects` is one card.

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Stable slug (kebab-case). Never rename once live. |
| `name` | yes | Card title. |
| `description` | yes | One line shown on the card. |
| `category` | yes | `game`, `app`, or `site` — drives filter chips. |
| `status` | yes | `Live`, `Testing`, `In progress`, `Early`, or `Parked`. |
| `liveUrl` | yes | HTTPS URL or `null` if nothing public. **Do not invent URLs.** |
| `githubRepo` | yes | Public repo name under `T0PK1DK`, or `null` if private / not on GitHub. |
| `lastUpdated` | yes | `YYYY-MM-DD`. Auto-updated when `githubRepo` is set (see script below). |
| `updateNote` | yes | Short note for the card and the **Updates** feed. |

### Add a new project

1. Open `data/projects.json`.
2. Append a new object to `projects` with a unique `id`.
3. Set `liveUrl` to a real public URL, or `https://toybox-soon.pages.dev` while a build is still in progress.
4. Use **`Testing`** when the live site still runs on demo, seed, or draft/bot-generated data (see repo README).
4. Set `githubRepo` to the repo name if it is public under [T0PK1DK](https://github.com/T0PK1DK); otherwise `null` and maintain `lastUpdated` by hand.
5. Write `updateNote` in plain language (one or two sentences).
6. Run `npm test` (validates JSON and required files).

**Do not add** empty placeholders (RCC, APEX, CLAVE), private internal tools, or parked SLIPPS/V-L unless they gain a real `liveUrl`.

The shelf is meant to list **every real project**, including private games and apps. Those cards use `githubRepo: null` so the UI never links a private repo. Use **Coming soon** (no `liveUrl`) with status `In progress` or `Early`.

To rebuild the JSON from the public GitHub list plus the private catalog in code:

```bash
node scripts/write-projects-json.mjs
npm run refresh:dates
npm test
```

Edit the `PRIVATE` array in `scripts/write-projects-json.mjs` when adding a new private repo slug, or append directly to `data/projects.json`.

### Privacy

- Sensitive URLs and titles live only in **gitignored** `data/private.json`, encrypted to `data/private.enc.json`. Never commit the plaintext file or the vault password.
- Do **not** put King's legal name in public site copy; use **T0PK1DK** / **King's Toy Box**.
- `npm test` scans the repo for forbidden hostname fragments outside the ciphertext bundle.

## Private shelf (encrypted)

King-only project links are **not** in `data/projects.json`. They live in gitignored `data/private.json`:

```json
{
  "projects": [
    { "title": "Project name", "url": "https://…", "note": "Short note for the card." }
  ]
}
```

Encrypt before deploy (password only via environment — never commit it):

```bash
export PRIVATE_PASSWORD='your-password-here'
npm run encrypt-private
npm test
```

- Uses **PBKDF2-SHA256** (210k iterations) + **AES-GCM**. Only `data/private.enc.json` is committed (`salt`, `iv`, `ciphertext`, `cardCount`).
- The site unlocks in the browser for the **session** (`sessionStorage`); use **Lock** to clear.
- Wrong password shows **Wrong password**; no hints.

### Post an update note

1. Find the project by `id` in `data/projects.json`.
2. Change `updateNote` to the new message.
3. Set `lastUpdated` to today (`YYYY-MM-DD`) when the note is newsworthy.
4. Optionally run `npm run refresh:dates` first so GitHub-backed `lastUpdated` values stay in sync with `pushed_at`.

The **Updates** section on the homepage shows the five newest entries by `lastUpdated` (projects that have an `updateNote`).

## Refresh GitHub dates

```bash
npm run refresh:dates
```

- Reads `data/projects.json`.
- For each project with `githubRepo`, calls the public GitHub API (no token).
- Writes `lastUpdated` from `pushed_at` (UTC date only).
- Waits between requests and retries on rate limit (`403` / `429`) using `Retry-After` or `X-RateLimit-Reset`.
- Skips missing or private repos without failing the whole run.

Run this periodically or before deploy if you want shelf dates to match GitHub activity.

## Validate

```bash
npm test
# or
npm run build
```

## UI code

| File | Role |
| --- | --- |
| `index.html` | Toy Box shell, meta/OG tags, filters markup |
| `js/toybox.js` | Loads JSON, renders cards + Updates feed, theme toggle |
| `js/private-vault.js` | Password gate + decrypts `private.enc.json` |
| `css/site.css` | Shared styles + Toy Box glass cards and dark mode |
| `js/site.js` | Header, mobile nav (unchanged) |

Night mode preference is stored in `localStorage` under `toybox-theme`.

## Recently updated (Oct 15)

Cards show "Updated <date>" from `lastUpdated` (green dot when within 7 days), and the sheet note ends with the same date. The **Recently updated** chip sorts every card newest first. Keep `lastUpdated` honest: many cards still carry the `2026-06-01` placeholder, so bump the date whenever a project ships. Previews for `bay-9` (night strip) and `invert` (gameplay) refreshed Oct 15.

## Deploy

Same as `README.md`: Cloudflare Pages, output directory repo root, domain `t0pk1dk.com`. No merge or deploy from this doc alone — push and let Pages build.
