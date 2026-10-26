# T0PK1DK

Public name for all the dev and AI work. Apps, games, and sites for people who want them shipped.

**King's Toy Box:** [t0pk1dk.com](https://t0pk1dk.com)  
**GitHub:** [github.com/T0PK1DK](https://github.com/T0PK1DK)

Project cards and update notes live in `data/projects.json`. See `HANDOFF.md`.

## Deploy

Cloudflare Pages, static.

- Build command: none
- Output directory: `/` (repo root)
- Custom domain: `t0pk1dk.com`

Pretty URLs come from folder pages (`/work/`, `/about/`, `/contact/`, `/iron-command/`). `/sites/` redirects to the Toy Box home.

```bash
npm test              # validate data + files
npm run refresh:dates # sync lastUpdated from GitHub API
```
