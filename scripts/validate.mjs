#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { listPublicRepos } from "./sync-public-repos.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_PATH = join(ROOT, "data", "projects.json");

const STATUSES = new Set(["Live", "In progress", "Early", "Parked"]);
const CATEGORIES = new Set(["game", "app", "site"]);
const MIN_PROJECTS = 25;

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

  console.log(`validate: OK (${doc.projects.length} projects)`);
}

main();
