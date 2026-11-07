#!/usr/bin/env node
// Computes the frozen hashes that preregister a study design, and writes
// them into the design file.
//
// Hash rules (documented in the design's hash_inputs):
// - skill_hash: sha256 over the installed skill bundle (SKILL_FILES from
//   scripts/install-skill.mjs), files sorted by path; per file
//   "<path>\u0000<bytes>\u0000" so renames change the hash.
// - snapshot_hash: same rule over benchmarks/snapshot/**.
// - prompt_hash: sha256 of benchmarks/run-instructions.md (the canonical
//   composition sources: shared run instructions + both condition
//   paragraphs). The composed per-condition prompt is hashed per pair in
//   mapping.json at preparation time.
// - protocol_hash: sha256 of benchmarks/CONFIRMATORY-STUDY.md.
//
// Usage: node scripts/freeze-study-design.mjs <study-design.json>
import { readFile, readdir, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SKILL_FILES } from "./install-skill.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function listFilesRecursive(dir, prefix = "") {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? prefix + "/" + entry.name : entry.name;
    if (entry.isDirectory()) out.push(...(await listFilesRecursive(path.join(dir, entry.name), rel)));
    else if (entry.isFile()) out.push(rel);
  }
  return out.sort();
}

async function bundleHash(root, files) {
  const hash = crypto.createHash("sha256");
  for (const file of files) {
    const bytes = await readFile(path.join(root, file));
    hash.update(file + "\u0000");
    hash.update(bytes);
    hash.update("\u0000");
  }
  return "sha256:" + hash.digest("hex");
}

export async function computeFrozenHashes(repoRoot = ROOT) {
  const skillFiles = [...SKILL_FILES].sort();
  const snapshotFiles = (await listFilesRecursive(path.join(repoRoot, "benchmarks/snapshot"))).map((f) => "benchmarks/snapshot/" + f);
  const file = async (rel) => readFile(path.join(repoRoot, rel));
  return {
    skill_hash: await bundleHash(repoRoot, skillFiles),
    snapshot_hash: await bundleHash(repoRoot, snapshotFiles),
    prompt_hash: "sha256:" + crypto.createHash("sha256").update(await file("benchmarks/run-instructions.md")).digest("hex"),
    protocol_hash: "sha256:" + crypto.createHash("sha256").update(await file("benchmarks/CONFIRMATORY-STUDY.md")).digest("hex")
  };
}

async function main() {
  const target = process.argv.slice(2).find((arg) => !arg.startsWith("--"));
  if (!target) {
    console.error("Usage: node scripts/freeze-study-design.mjs <study-design.json>");
    process.exitCode = 2;
    return;
  }
  const designPath = path.resolve(target);
  const design = JSON.parse(await readFile(designPath, "utf8"));
  design.frozen = { ...(design.frozen ?? {}), ...(await computeFrozenHashes()) };
  await writeFile(designPath, JSON.stringify(design, null, 2) + "\n");
  console.log("Froze " + designPath);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Freeze failed: " + error.message);
    process.exitCode = 1;
  });
}
