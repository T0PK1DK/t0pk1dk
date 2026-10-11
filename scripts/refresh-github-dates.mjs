#!/usr/bin/env node
/**
 * Refresh lastUpdated on projects that have a public githubRepo.
 * Uses unauthenticated GitHub API (60 req/hr). Handles rate limits gracefully.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "projects.json");
const GITHUB_USER = "T0PK1DK";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function githubFetch(url, attempt = 0) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "t0pk1dk-toybox-refresh",
    },
  });

  if (res.status === 403 || res.status === 429) {
    const remaining = res.headers.get("x-ratelimit-remaining");
    const reset = res.headers.get("x-ratelimit-reset");
    const retryAfter = res.headers.get("retry-after");
    const waitMs = retryAfter
      ? Number(retryAfter) * 1000
      : reset
        ? Math.max(0, Number(reset) * 1000 - Date.now()) + 1000
        : Math.min(60_000, 4000 * (attempt + 1));

    if (attempt < 4) {
      console.warn(
        `Rate limited (HTTP ${res.status}, remaining=${remaining}). Waiting ${Math.round(waitMs / 1000)}s…`,
      );
      await sleep(waitMs);
      return githubFetch(url, attempt + 1);
    }
    throw new Error(`GitHub rate limit exceeded after retries (HTTP ${res.status}).`);
  }

  if (!res.ok) {
    return { ok: false, status: res.status };
  }

  const data = await res.json();
  return { ok: true, data };
}

function toDateOnly(iso) {
  if (!iso) return null;
  return iso.slice(0, 10);
}

async function main() {
  const raw = readFileSync(DATA_PATH, "utf8");
  const doc = JSON.parse(raw);
  let changed = 0;
  let skipped = 0;

  for (const project of doc.projects) {
    const repo = project.githubRepo;
    if (!repo) {
      skipped += 1;
      continue;
    }

    const url = `https://api.github.com/repos/${GITHUB_USER}/${encodeURIComponent(repo)}`;
    const result = await githubFetch(url);

    if (!result.ok) {
      console.warn(`Skip ${project.id}: repo ${repo} → HTTP ${result.status}`);
      skipped += 1;
      continue;
    }

    const pushed = toDateOnly(result.data.pushed_at);
    if (!pushed) {
      skipped += 1;
      continue;
    }

    if (project.lastUpdated !== pushed) {
      console.log(`${project.name}: ${project.lastUpdated} → ${pushed}`);
      project.lastUpdated = pushed;
      changed += 1;
    }

    await sleep(120);
  }

  if (changed > 0) {
    writeFileSync(DATA_PATH, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
    console.log(`Updated ${changed} project date(s).`);
  } else {
    console.log("No date changes.");
  }

  if (skipped) {
    console.log(`Skipped ${skipped} project(s) (no repo or API miss).`);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
