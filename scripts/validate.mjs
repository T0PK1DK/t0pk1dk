#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { listPublicRepos } from "./sync-public-repos.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "projects.json");

const STATUSES = new Set(["Live", "In progress", "Early", "Parked"]);
const CATEGORIES = new Set(["game", "app", "site"]);
const MIN_PROJECTS = 25;
const FORBIDDEN_URL = "kingleonardjr19";
const FORBIDDEN_TEXT = [/king\s+leonard/i, /leonard\s+jr\.?/i];
const EXCLUDED_PROJECT_IDS = new Set();
const SCAN_SKIP = new Set(["node_modules", ".git", "package-lock.json"]);

function scanTreePrivacy(dir, hits = []) {
  for (const name of readdirSync(dir)) {
    if (SCAN_SKIP.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      scanTreePrivacy(full, hits);
      continue;
    }
    if (!/\.(html|json|md|js|mjs|css|xml|txt|webmanifest|svg)$/i.test(name)) continue;
    const text = readFileSync(full, "utf8");
    const rel = relative(ROOT, full);
    const forbiddenUrl = new RegExp(`https?:\\/\\/[^\\s"'<>]*${FORBIDDEN_URL}`, "i");
    if (forbiddenUrl.test(text)) hits.push(`${rel}: contains forbidden URL`);
    for (const re of FORBIDDEN_TEXT) {
      if (re.test(text)) hits.push(`${rel}: contains forbidden legal name text`);
    }
  }
  return hits;
}

function fail(msg) {
  console.error(`validate: ${msg}`);
  process.exit(1);
}

async function main() {
  if (!existsSync(DATA_PATH)) fail("missing data/projects.json");

  let doc;
  try {
    doc = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  } catch {
    fail("projects.json is not valid JSON");
  }

  if (!Array.isArray(doc.projects) || doc.projects.length < MIN_PROJECTS) {
    fail(`projects must have at least ${MIN_PROJECTS} entries`);
  }

  const ids = new Set();
  const githubLinks = new Set();

  for (const p of doc.projects) {
    for (const key of ["id", "name", "description", "category", "status", "lastUpdated", "updateNote"]) {
      if (p[key] === undefined || p[key] === null || p[key] === "") {
        fail(`project ${p.id || "?"} missing ${key}`);
      }
    }
    if (ids.has(p.id)) fail(`duplicate id: ${p.id}`);
    ids.add(p.id);
    if (!CATEGORIES.has(p.category)) fail(`${p.id}: invalid category`);
    if (!STATUSES.has(p.status)) fail(`${p.id}: invalid status`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.lastUpdated)) fail(`${p.id}: lastUpdated must be YYYY-MM-DD`);
    if (p.liveUrl !== null && p.liveUrl !== undefined && !/^https:\/\//.test(p.liveUrl)) {
      fail(`${p.id}: liveUrl must be https or null`);
    }
    if (p.githubRepo !== null && p.githubRepo !== undefined && typeof p.githubRepo !== "string") {
      fail(`${p.id}: githubRepo must be string or null`);
    }
    if (p.githubRepo) githubLinks.add(p.githubRepo);
    if (!p.liveUrl && p.status === "Live") {
      fail(`${p.id}: Live status requires liveUrl`);
    }
    if (EXCLUDED_PROJECT_IDS.has(p.id)) {
      fail(`${p.id}: must not appear on the Toy Box shelf`);
    }
    if (p.liveUrl && p.liveUrl.toLowerCase().includes(FORBIDDEN_URL)) {
      fail(`${p.id}: liveUrl must not contain ${FORBIDDEN_URL}`);
    }
  }

  const required = ["index.html", "js/toybox.js", "css/site.css", "HANDOFF.md"];
  for (const rel of required) {
    if (!existsSync(join(ROOT, rel))) fail(`missing ${rel}`);
  }

  let publicNames;
  try {
    const repos = await listPublicRepos();
    publicNames = new Set(repos.map((r) => r.name));
  } catch (err) {
    console.warn(`validate: skipping GitHub cross-check (${err.message})`);
    publicNames = null;
  }

  if (publicNames) {
    for (const repo of githubLinks) {
      if (!publicNames.has(repo)) {
        fail(`githubRepo "${repo}" is not a visible public repo — remove the link`);
      }
    }
  }

  const privacyHits = scanTreePrivacy(ROOT);
  if (privacyHits.length) {
    for (const h of privacyHits) console.error(`validate: ${h}`);
    fail("privacy check failed");
  }

  let clickable = 0;
  for (const p of doc.projects) {
    if (p.liveUrl && !p.liveUrl.toLowerCase().includes(FORBIDDEN_URL)) {
      clickable += 1;
      continue;
    }
    if (publicNames && p.githubRepo && publicNames.has(p.githubRepo)) {
      clickable += 1;
    }
  }

  console.log(`validate: OK (${doc.projects.length} projects, ${clickable} clickable)`);
}

main();
