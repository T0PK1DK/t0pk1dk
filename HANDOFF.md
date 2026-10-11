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
| `status` | yes | `Live`, `In progress`, `Early`, or `Parked`. |
| `liveUrl` | yes | HTTPS URL or `null` if nothing public. **Do not invent URLs.** |
| `githubRepo` | yes | Public repo name under `T0PK1DK`, or `null` if private / not on GitHub. |
| `lastUpdated` | yes | `YYYY-MM-DD`. Auto-updated when `githubRepo` is set (see script below). |
| `updateNote` | yes | Short note for the card and the **Updates** feed. |

### Add a new project

1. Open `data/projects.json`.
2. Append a new object to `projects` with a unique `id`.
3. Set `liveUrl` only if a real public URL exists (homepage, known Pages domain, etc.).
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

- **Never** commit URLs containing `kingleonardjr19` (including `*.workers.dev` addresses that expose a legal name).
- Do **not** put King's legal name in site copy; use **T0PK1DK** / **King's Toy Box** in public text.
- The public **Notebook** card uses `https://kingsnotes.pages.dev` only — never workers.dev URLs with forbidden name fragments.
- `npm test` scans tracked source files for forbidden URL fragments and legal-name text.

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
| `css/site.css` | Shared styles + Toy Box glass cards and dark mode |
| `js/site.js` | Header, mobile nav (unchanged) |

Night mode preference is stored in `localStorage` under `toybox-theme`.

## Deploy

Same as `README.md`: Cloudflare Pages, output directory repo root, domain `t0pk1dk.com`. No merge or deploy from this doc alone — push and let Pages build.
