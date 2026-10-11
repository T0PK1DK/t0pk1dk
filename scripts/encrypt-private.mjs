#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { encryptPrivatePayload } from "./crypto-private.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INPUT = join(ROOT, "data", "private.json");
const OUTPUT = join(ROOT, "data", "private.enc.json");

const password = process.env.PRIVATE_PASSWORD;
if (!password) {
  console.error("encrypt-private: set PRIVATE_PASSWORD in the environment.");
  process.exit(1);
}

if (!existsSync(INPUT)) {
  console.error("encrypt-private: missing data/private.json (gitignored — create locally).");
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(readFileSync(INPUT, "utf8"));
} catch {
  console.error("encrypt-private: data/private.json is not valid JSON.");
  process.exit(1);
}

if (!Array.isArray(payload.projects) || payload.projects.length === 0) {
  console.error("encrypt-private: projects array is required.");
  process.exit(1);
}

const envelope = await encryptPrivatePayload(password, payload);
envelope.cardCount = payload.projects.length;

writeFileSync(OUTPUT, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
console.log(`encrypt-private: wrote ${OUTPUT} (${envelope.cardCount} cards).`);
