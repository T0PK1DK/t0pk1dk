#!/usr/bin/env node
/** One-off generator — run manually if rebuilding from scratch. */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchReadmeOneline, listPublicRepos } from "./sync-public-repos.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "data", "projects.json");

const LIVE = {
  slide: "https://kings-slide.pages.dev",
  "actually-worth-it": "https://actuallyworthit.com",
  beep: "https://get-beep.com",
  "buzzahhjitt-links": "https://buzzahhjitt-links.pages.dev",
  "product-funnel": "https://t0pk1dk.github.io/product-funnel/",
};

/** Private or non-GitHub-visible builds — no githubRepo on the card. */
const PRIVATE = [
  { id: "bay-9", name: "Bay 9", category: "game", description: "Bay 9 — private sci-fi game build." },
  { id: "conclave", name: "CONCLAVE", category: "game", description: "CONCLAVE — private strategy game in development." },
  { id: "dominous", name: "Dominous", category: "game", description: "Dominous — dominoes-style game prototype." },
  { id: "e-sekai", name: "E-SEKAI", category: "game", description: "E-SEKAI — narrative isekai-themed game project." },
  { id: "euts", name: "EUTS", category: "app", description: "EUTS — private utility app codebase." },
  { id: "grindex", name: "Grindex", category: "app", description: "Grindex — private indexing or grid app experiment." },
  { id: "helios-dominion", name: "Helios Dominion", category: "game", description: "3D orbital god-simulator and planetary base-builder (TypeScript)." },
  { id: "hilo-game", name: "HILO", category: "game", description: "Hi-Lo card game — private build." },
  { id: "invert", name: "INVERT", category: "game", description: "Puzzle game built around inversion — private repo." },
  { id: "lajan", name: "LAJAN", category: "app", description: "LAJAN — private app project." },
  { id: "micasa", name: "MiCasa", category: "app", description: "MiCasa — home and household helper app." },
  { id: "nard", name: "Nard", category: "game", description: "Nard — backgammon-family game build." },
  { id: "rdf", name: "RDF", category: "app", description: "RDF — linked-data or tooling project." },
  { id: "respawn-hq", name: "Respawn HQ", category: "app", description: "Respawn HQ — game-dev hub and ops tooling." },
  { id: "snaggit", name: "SNAGGIT", category: "game", description: "SNAGGIT — arcade-style catch game prototype." },
  { id: "sprain", name: "SPRAIN", category: "game", description: "SPRAIN — private game prototype." },
  { id: "stellar-evolution", name: "Stellar Evolution", category: "game", description: "Stellar evolution simulation and game systems." },
  { id: "sweet-d", name: "SWEET-D", category: "game", description: "SWEET-D — private game project." },
  { id: "tapn", name: "TAPN", category: "app", description: "TAPN — tap-timing social app experiment." },
  { id: "tastyhabits", name: "TastyHabits", category: "app", description: "TastyHabits — habit tracking with a food-friendly angle." },
  { id: "terra", name: "Terra", category: "game", description: "Terra — terrain and world-building game code." },
  { id: "the-wall", name: "The WALL", category: "app", description: "The WALL — private app build (details on request)." },
  { id: "zonez", name: "ZONEZ", category: "app", description: "ZONEZ — private zone puzzle app." },
];

const PUBLIC_META = {
  Slide: { id: "slide", name: "Slide", category: "app" },
  actuallyworthit: { id: "actually-worth-it", name: "Actually Worth It", category: "site" },
  nabu: { id: "nabu", name: "Nabu", category: "app" },
  "product-funnel": { id: "product-funnel", name: "product-funnel", category: "site" },
  "t0pk1dk-launch-kit": { id: "launch-kit", name: "T0PK1DK Launch Kit", category: "site" },
};

function statusFor(project) {
  if (project.liveUrl) return "Live";
  if (project.category === "site") return "Early";
  return "In progress";
}

function noteFor(p) {
  if (p.liveUrl) return `On the shelf with a live link — last synced from repo activity where public.`;
  if (p.githubRepo) return `Public repo on GitHub; no public site URL yet.`;
  return `Private build on the shelf — no public repo link.`;
}

async function main() {
  const repos = await listPublicRepos();
  const projects = [];

  for (const repo of repos) {
    const meta = PUBLIC_META[repo.name];
    if (!meta) continue;
    let description = repo.description?.trim() || null;
    if (!description) description = await fetchReadmeOneline("T0PK1DK", repo.name);
    if (!description) description = `${meta.name} — T0PK1DK project.`;

    const liveUrl = LIVE[meta.id] || (repo.homepage?.startsWith("http") ? repo.homepage : null);
    let status = "In progress";
    if (meta.id === "launch-kit") status = "Early";
    else if (liveUrl && meta.id !== "slide") status = "Live";
    const project = {
      id: meta.id,
      name: meta.name,
      description,
      category: meta.category,
      status,
      liveUrl,
      githubRepo: repo.name,
      lastUpdated: repo.pushed_at.slice(0, 10),
      updateNote: noteFor({ liveUrl, githubRepo: repo.name }),
    };
    projects.push(project);
  }

  for (const row of PRIVATE) {
    const liveUrl = LIVE[row.id] || null;
    projects.push({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      status: liveUrl ? "Live" : row.category === "site" ? "Early" : "In progress",
      liveUrl,
      githubRepo: null,
      lastUpdated: "2026-06-01",
      updateNote: liveUrl
        ? "Live site linked; GitHub repo stays private."
        : "Private build — card only, no public repo link.",
    });
  }

  projects.push({
    id: "beep",
    name: "BEEP",
    description: "BEEP product site and brand — shipped on get-beep.com.",
    category: "site",
    status: "Live",
    liveUrl: LIVE.beep,
    githubRepo: null,
    lastUpdated: "2026-06-01",
    updateNote: "Live at get-beep.com; repo is private.",
  });

  projects.push({
    id: "buzzahhjitt-links",
    name: "BuzzahhJitt Links",
    description: "Link hub for BuzzahhJitt — socials and pages in one place.",
    category: "site",
    status: "Live",
    liveUrl: LIVE["buzzahhjitt-links"],
    githubRepo: null,
    lastUpdated: "2026-06-01",
    updateNote: "Live on Cloudflare Pages; repo is private.",
  });

  projects.sort((a, b) => a.name.localeCompare(b.name, "en"));

  writeFileSync(OUT, `${JSON.stringify({ projects }, null, 2)}\n`);
  console.log(`Wrote ${projects.length} projects to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
