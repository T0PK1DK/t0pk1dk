#!/usr/bin/env node
/**
 * Fetches public T0PK1DK repos (name, description, homepage, pushed_at, fork, empty).
 * Used by validate.mjs and refresh-github-dates.mjs.
 */
const GITHUB_USER = "T0PK1DK";

export const HIDDEN_REPO_NAMES = new Set(
  ["rcc", "apex", "clave", "slipps", "v-l", "testdasite2", "cursor-plugin", "t0pk1dk"].map((s) =>
    s.toLowerCase(),
  ),
);

export const SKIP_FORKS = true;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function githubFetch(url, attempt = 0) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "t0pk1dk-toybox-sync",
    },
  });

  if (res.status === 403 || res.status === 429) {
    const retryAfter = res.headers.get("retry-after");
    const reset = res.headers.get("x-ratelimit-reset");
    const waitMs = retryAfter
      ? Number(retryAfter) * 1000
      : reset
        ? Math.max(0, Number(reset) * 1000 - Date.now()) + 1000
        : 4000 * (attempt + 1);
    if (attempt < 4) {
      await sleep(waitMs);
      return githubFetch(url, attempt + 1);
    }
    throw new Error(`GitHub rate limit (HTTP ${res.status})`);
  }

  if (!res.ok) {
    return { ok: false, status: res.status };
  }

  return { ok: true, data: await res.json() };
}

export async function fetchReadmeOneline(owner, repo) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: { Accept: "application/vnd.github.raw", "User-Agent": "t0pk1dk-toybox-sync" },
  });
  if (!res.ok) return null;
  const text = await res.text();
  const lines = text.split(/\n/).map((l) => l.replace(/^#+\s*/, "").trim());
  for (const line of lines) {
    if (line.length < 12) continue;
    if (line.startsWith("!") || line.startsWith("[")) continue;
    if (/^by \[T0PK1DK\]/i.test(line)) continue;
    return line.replace(/\s+/g, " ").slice(0, 180);
  }
  return null;
}

export async function listPublicRepos() {
  const repos = [];
  for (let page = 1; page <= 5; page++) {
    const result = await githubFetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&page=${page}&sort=pushed`,
    );
    if (!result.ok) throw new Error(`List repos failed: HTTP ${result.status}`);
    const batch = result.data;
    if (!batch.length) break;
    repos.push(...batch);
    if (batch.length < 100) break;
    await sleep(150);
  }
  return repos.filter((r) => {
    if (SKIP_FORKS && r.fork) return false;
    if (HIDDEN_REPO_NAMES.has(r.name.toLowerCase())) return false;
    if (r.private) return false;
    return true;
  });
}
