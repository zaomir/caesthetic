#!/usr/bin/env node
/**
 * Verify a case-study cover is on disk and registered, or print the generation prompt.
 * Usage:
 *   node scripts/caesthetic/check-case-cover.mjs <slug>
 *   node scripts/caesthetic/check-case-cover.mjs <slug> --prompt --niche "med spa" --city "Miami" --metaphor "three cords joining one path"
 */

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("../..", import.meta.url).pathname);
const args = process.argv.slice(2);
const slug = args.find((value) => !value.startsWith("--"));

function flagValue(name) {
  const index = args.indexOf(name);
  if (index === -1 || !args[index + 1] || args[index + 1].startsWith("--")) return "";
  return args[index + 1];
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
}

if (!slug) {
  fail("usage: node scripts/caesthetic/check-case-cover.mjs <slug> [--prompt --niche … --city … --metaphor …]");
  process.exit(2);
}

if (args.includes("--prompt")) {
  const niche = flagValue("--niche") || "{niche}";
  const city = flagValue("--city") || "{city}";
  const metaphor = flagValue("--metaphor") || "{one visual metaphor, objects only}";
  process.stdout.write(`Photoreal editorial still life, 4:3 landscape. Quiet professional interior for a ${niche} practice in ${city}.
Empty room. No people, no faces, no hands, no bodies, no mannequins.
No logos, no brand marks, no letters, no numbers, no readable screens, no fake dashboards.
No clinical before/after, no treatment on skin, no identifiable clinic exterior or street number.
Metaphor of the case constraint: ${metaphor}.
Soft daylight, restrained palette, no watermark, no caption.
Save as site-caesthetic/assets/case-studies/covers/${slug}.webp then register case.${slug}.cover.
`);
  process.exit(0);
}

const registryPath = resolve(root, "site-caesthetic/media/registry.json");
const registry = JSON.parse(readFileSync(registryPath, "utf8"));
const mediaId = `case.${slug}.cover`;
const entry = registry.entries?.[mediaId];
if (!entry) {
  fail(`missing registry entry ${mediaId}`);
} else {
  const rel = String(entry.src || "").replace(/^\//, "");
  const file = resolve(root, "site-caesthetic", rel);
  if (!existsSync(file)) fail(`missing cover file ${file}`);
  else {
    const buf = readFileSync(file);
    const sha = createHash("sha256").update(buf).digest("hex");
    if (entry.sha256 && entry.sha256 !== sha) fail(`sha256 mismatch for ${mediaId}: registry ${entry.sha256} file ${sha}`);
    if (entry.state !== "approved") fail(`${mediaId} state is ${entry.state}, expected approved`);
    if (!Array.isArray(entry.allowed_channels) || !entry.allowed_channels.includes("public")) {
      fail(`${mediaId} must allow the public channel`);
    }
    if (String(entry.src).includes("/placeholders/")) fail(`${mediaId} still points at a placeholder`);
    if (!process.exitCode) process.stdout.write(`OK ${mediaId} ${sha}\n`);
  }
}
