#!/usr/bin/env node
import { cp, mkdir, readFile, writeFile, stat } from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { randomInt } from "node:crypto";
import { fileURLToPath } from "node:url";
import { installSkill } from "./install-skill.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseInstructionSections(markdown) {
  const sections = {};
  let current = null;
  for (const line of markdown.split("\n")) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) { current = heading[1]; sections[current] = []; continue; }
    if (current) sections[current].push(line);
  }
  const trim = (name) => (sections[name] ?? []).join("\n").trim();
  const shared = trim("Shared run instructions");
  const baseline = trim("Baseline addition");
  const uadi = trim("UADI addition");
  if (!shared || !baseline || !uadi) {
    throw new Error("benchmarks/run-instructions.md must contain 'Shared run instructions', 'Baseline addition' and 'UADI addition' sections");
  }
  return { shared, baseline, uadi };
}

export function composePrompt(brief, instructions, condition) {
  const paragraph = condition === "baseline" ? instructions.baseline : instructions.uadi;
  return brief.trimEnd() + "\n\n---\n\n## Run instructions\n\n" + instructions.shared + "\n\n" + paragraph + "\n";
}

function sha256Hex(text) {
  return "sha256:" + crypto.createHash("sha256").update(text).digest("hex");
}

const VALID_FLAGS = ["--study-id", "--pair-id", "--task-id", "--snapshot", "--runs-dir", "--study-design"];

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const flag = args[i];
    if (!VALID_FLAGS.includes(flag)) {
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

export async function loadPreregisteredSchedule(studyDesignPath, options) {
  const design = JSON.parse(await readFile(path.resolve(studyDesignPath), "utf8"));
  if (design.study_id && design.study_id !== options.studyId) {
    throw new Error("Study design study_id " + design.study_id + " does not match --study-id " + options.studyId);
  }
  const pair = (design.design?.pairs ?? []).find((entry) => entry?.pair_id === options.pairId);
  if (!pair) throw new Error("Pair " + options.pairId + " is not in the preregistered study design " + studyDesignPath);
  if (pair.task_id !== options.taskId) {
    throw new Error("Pair " + options.pairId + " is preregistered for task " + pair.task_id + ", not " + options.taskId);
  }
  if (!["A", "B"].includes(pair.uadi_position)) {
    throw new Error("Pair " + options.pairId + " has no valid uadi_position in the study design");
  }
  if (![1, 2].includes(pair.baseline_run_position)) {
    throw new Error("Pair " + options.pairId + " has no valid baseline_run_position in the study design");
  }
  return {
    uadiPosition: pair.uadi_position,
    baselineRunPosition: pair.baseline_run_position,
    runOrder: pair.baseline_run_position === 1 ? ["baseline", "uadi"] : ["uadi", "baseline"],
    blindMapping: pair.uadi_position === "A"
      ? { "condition-a": "uadi", "condition-b": "baseline" }
      : { "condition-a": "baseline", "condition-b": "uadi" }
  };
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

  const schedule = options.studyDesign ? await loadPreregisteredSchedule(options.studyDesign, options) : null;
  const order = schedule ? schedule.runOrder : (randomInt(2) === 0 ? ["baseline", "uadi"] : ["uadi", "baseline"]);

  const runInstructions = parseInstructionSections(
    await readFile(path.join(ROOT, "benchmarks/run-instructions.md"), "utf8")
  );
  const briefPath = path.join(ROOT, "benchmarks/tasks/" + options.taskId + ".md");
  const briefText = await readFile(briefPath, "utf8").catch((error) => {
    if (error.code === "ENOENT") {
      if (schedule) throw new Error("Task brief benchmarks/tasks/" + options.taskId + ".md not found for the preregistered task");
      return "# Task prompt\n\nCopy the exact benchmark task prompt here.\n";
    }
    throw error;
  });
  const conditionPrompts = {
    baseline: composePrompt(briefText, runInstructions, "baseline"),
    uadi: composePrompt(briefText, runInstructions, "uadi")
  };
  const promptHashes = {
    baseline: sha256Hex(conditionPrompts.baseline),
    uadi: sha256Hex(conditionPrompts.uadi)
  };

  if (schedule) {
    const design = JSON.parse(await readFile(path.resolve(options.studyDesign), "utf8"));
    const instructionBytes = await readFile(path.join(ROOT, "benchmarks/run-instructions.md"));
    const actual = "sha256:" + crypto.createHash("sha256").update(instructionBytes).digest("hex");
    if (design.frozen?.prompt_hash && design.frozen.prompt_hash !== actual) {
      throw new Error("Run instructions changed since the study was frozen (frozen.prompt_hash mismatch). Re-freeze and re-validate before running.");
    }
  }

  await mkdir(pairDir, { recursive: true });
  for (const condition of ["baseline", "uadi"]) {
    const conditionDir = path.join(pairDir, condition);
    await mkdir(path.join(conditionDir, "evidence", "screenshots"), { recursive: true });
    await mkdir(path.join(conditionDir, "evidence", "test-output"), { recursive: true });
    await mkdir(path.join(conditionDir, "evidence", "changed-files"), { recursive: true });
    await cp(snapshot, path.join(conditionDir, "project"), { recursive: true });
    await writeFile(path.join(conditionDir, "prompt.md"), conditionPrompts[condition]);
    await writeFile(path.join(conditionDir, "transcript.md"), "# Run transcript\n\nRecord the complete transcript here.\n");
    if (schedule && condition === "uadi") {
      await installSkill({ agent: "codex", cwd: path.join(conditionDir, "project"), force: true });
    }
  }
  await mkdir(path.join(pairDir, "blind", "condition-a"), { recursive: true });
  await mkdir(path.join(pairDir, "blind", "condition-b"), { recursive: true });
  const blindMapping = schedule ? schedule.blindMapping : (randomInt(2) === 0
    ? { "condition-a": "baseline", "condition-b": "uadi" }
    : { "condition-a": "uadi", "condition-b": "baseline" });
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
  if (schedule) {
    metadata.uadi_position = schedule.uadiPosition;
    metadata.baseline_run_position = schedule.baselineRunPosition;
    metadata.study_design = path.resolve(options.studyDesign);
    metadata.schedule = "preregistered";
    metadata.frozen = JSON.parse(await readFile(path.resolve(options.studyDesign), "utf8")).frozen ?? null;
  }
  metadata.prompt_hashes = promptHashes;
  await writeFile(path.join(pairDir, "mapping.json"), JSON.stringify(metadata, null, 2) + "\n");
  return { pairDir, order, schedule };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await prepareBenchmarkPair(options);
  console.log("Created " + result.pairDir);
  if (result.schedule) {
    console.log("Preregistered schedule: UADI is Candidate " + result.schedule.uadiPosition + ", run order " + result.order.join(" → "));
  } else {
    console.log("Randomized run order: " + result.order.join(" → "));
  }
  console.log("Run each condition from its own clean project copy; keep mapping.json from reviewers.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Benchmark scaffold failed: " + error.message);
    process.exitCode = 1;
  });
}
