#!/usr/bin/env node
import { cp, mkdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { randomInt } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const flag = args[i];
    if (!["--study-id", "--pair-id", "--task-id", "--snapshot", "--runs-dir"].includes(flag)) {
      throw new Error("Unknown option: " + flag);
    }
    const value = args[++i];
    if (!value || value.startsWith("--")) throw new Error("Missing value for " + flag);
    options[flag.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
  }
  for (const key of ["studyId", "pairId", "taskId", "snapshot"]) {
    if (!options[key]) throw new Error("Required option missing: --" + key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()));
  }
  for (const key of ["studyId", "pairId", "taskId"]) {
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(options[key])) {
      throw new Error(key + " must contain only letters, numbers, dots, underscores or hyphens");
    }
  }
  return options;
}

export async function prepareBenchmarkPair(options) {
  const snapshot = path.resolve(options.snapshot);
  const snapshotInfo = await stat(snapshot);
  if (!snapshotInfo.isDirectory()) throw new Error("--snapshot must be a directory");
  const runsRoot = path.resolve(options.runsDir ?? path.join(ROOT, "benchmarks/runs"));
  const pairDir = path.join(runsRoot, options.studyId, options.pairId);
  if (!pairDir.startsWith(runsRoot + path.sep)) throw new Error("Resolved pair directory is outside the runs directory");
  try { await stat(pairDir); throw new Error("Run already exists: " + pairDir); }
  catch (error) { if (error.code !== "ENOENT") throw error; }

  const order = randomInt(2) === 0 ? ["baseline", "uadi"] : ["uadi", "baseline"];
  await mkdir(pairDir, { recursive: true });
  for (const condition of ["baseline", "uadi"]) {
    const conditionDir = path.join(pairDir, condition);
    await mkdir(path.join(conditionDir, "evidence", "screenshots"), { recursive: true });
    await mkdir(path.join(conditionDir, "evidence", "test-output"), { recursive: true });
    await mkdir(path.join(conditionDir, "evidence", "changed-files"), { recursive: true });
    await cp(snapshot, path.join(conditionDir, "project"), { recursive: true });
    await writeFile(path.join(conditionDir, "prompt.md"), "# Task prompt\n\nCopy the exact benchmark task prompt here.\n");
    await writeFile(path.join(conditionDir, "transcript.md"), "# Run transcript\n\nRecord the complete transcript here.\n");
  }
  await mkdir(path.join(pairDir, "blind", "condition-a"), { recursive: true });
  await mkdir(path.join(pairDir, "blind", "condition-b"), { recursive: true });
  const blindMapping = randomInt(2) === 0
    ? { "condition-a": "baseline", "condition-b": "uadi" }
    : { "condition-a": "uadi", "condition-b": "baseline" };
  const metadata = {
    study_id: options.studyId,
    pair_id: options.pairId,
    task_id: options.taskId,
    snapshot: snapshot,
    run_order: order,
    blind_mapping: blindMapping,
    created_at: new Date().toISOString(),
    note: "Coordinator-only metadata. Keep this directory private until blind review is complete."
  };
  await writeFile(path.join(pairDir, "mapping.json"), JSON.stringify(metadata, null, 2) + "\n");
  return { pairDir, order };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await prepareBenchmarkPair(options);
  console.log("Created " + result.pairDir);
  console.log("Randomized run order: " + result.order.join(" → "));
  console.log("Run each condition from its own clean project copy; keep mapping.json from reviewers.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Benchmark scaffold failed: " + error.message);
    process.exitCode = 1;
  });
}
