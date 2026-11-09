#!/usr/bin/env node
// Prepare one paired B/C (or A/C) efficiency run.
//
// Left condition:
//   legacy   — install the pre-Stage-2 skill from --legacy-root (a checkout/archive).
//   baseline — install no design skill.
// Right condition:
//   optimized — install the current standard profile.
//
// Both conditions receive the same task brief, shared run instructions and prompt
// skeleton; only the installed skill differs. Candidate labels are mapped for
// blinded review in mapping.json.
//
// Usage:
//   node scripts/prepare-efficiency-pair.mjs \
//     --study-id efficiency-bc-2026-11 --pair-id subscription-settings-r1 \
//     --task-id subscription-settings --repetition 1 \
//     --snapshot <dir> --left legacy --legacy-root <dir>
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { installSkill } from "./install-skill.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(args) {
  const options = {
    runsDir: path.join(ROOT, "benchmarks/runs"),
    left: "legacy",
    right: "optimized",
    repetition: 1
  };
  const flags = ["--study-id", "--pair-id", "--task-id", "--snapshot", "--runs-dir", "--legacy-root", "--left", "--repetition"];
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (flag === "--help" || flag === "-h") {
      options.help = true;
      continue;
    }
    if (!flags.includes(flag)) throw new Error("Unknown option: " + flag);
    const value = args[++index];
    if (value === undefined || value.startsWith("--")) throw new Error("Missing value for " + flag);
    const key = flag.slice(2).replace(/-([a-z])/g, (_, character) => character.toUpperCase());
    options[key] = key === "repetition" ? Number(value) : value;
  }
  for (const key of ["studyId", "pairId", "taskId", "snapshot"]) {
    if (!options[key]) throw new Error("Missing --" + key.replace(/[A-Z]/g, (character) => "-" + character.toLowerCase()));
  }
  if (!["legacy", "baseline"].includes(options.left)) throw new Error("--left must be legacy or baseline");
  if (options.right !== "optimized") throw new Error("--right must be optimized");
  if (!Number.isInteger(options.repetition) || options.repetition < 1) throw new Error("--repetition must be a positive integer");
  if (options.left === "legacy" && !options.legacyRoot) throw new Error("--legacy-root is required when --left legacy");
  return options;
}

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
  if (!shared || !baseline || !uadi) throw new Error("benchmarks/run-instructions.md is missing required sections");
  return { shared, baseline, uadi };
}

function composePrompt(brief, instructions, condition) {
  const paragraph = condition === "baseline" ? instructions.baseline : instructions.uadi;
  return brief.trimEnd() + "\n\n---\n\n## Run instructions\n\n" + instructions.shared + "\n\n" + paragraph + "\n";
}

async function installLegacy(root, project) {
  const script = path.join(path.resolve(root), "scripts/install-skill.mjs");
  const result = spawnSync(process.execPath, [script, "--agent", "codex", "--cwd", project, "--force"], { encoding: "utf8" });
  if (result.status !== 0) throw new Error("Legacy skill install failed: " + (result.stderr || result.stdout));
}

export async function prepareEfficiencyPair(options) {
  const runsRoot = path.resolve(options.runsDir);
  const pairDir = path.join(runsRoot, options.studyId, options.pairId);
  const briefPath = path.join(ROOT, "benchmarks/tasks/" + options.taskId + ".md");
  const brief = await readFile(briefPath, "utf8");
  const instructions = parseInstructionSections(await readFile(path.join(ROOT, "benchmarks/run-instructions.md"), "utf8"));
  const snapshot = path.resolve(options.snapshot);

  for (const side of ["left", "right"]) {
    const conditionDir = path.join(pairDir, side);
    await mkdir(path.join(conditionDir, "evidence"), { recursive: true });
    await cp(snapshot, path.join(conditionDir, "project"), { recursive: true });
    const condition = side === "left" ? options.left : options.right;
    const prompt = composePrompt(brief, instructions, condition).replaceAll("<PROJECT>", path.join(conditionDir, "project"));
    await writeFile(path.join(conditionDir, "prompt.md"), prompt, "utf8");
    // Also place the brief inside the project so a builder that only reads its
    // working directory still receives the exact task and run instructions.
    await writeFile(path.join(conditionDir, "project", "prompt.md"), prompt, "utf8");
    await writeFile(path.join(conditionDir, "transcript.md"), "# Run transcript\n\nRecord the complete transcript here.\n", "utf8");
  }

  if (options.left === "legacy") {
    await installLegacy(options.legacyRoot, path.join(pairDir, "left/project"));
  }
  await installSkill({ agent: "codex", cwd: path.join(pairDir, "right/project"), force: true, profile: "standard" });

  const optimizedPosition = options.repetition % 2 === 1 ? "A" : "B";
  const blindMapping = optimizedPosition === "A"
    ? { "condition-a": "optimized", "condition-b": options.left }
    : { "condition-a": options.left, "condition-b": "optimized" };
  const mapping = {
    study_id: options.studyId,
    pair_id: options.pairId,
    task_id: options.taskId,
    repetition: options.repetition,
    snapshot,
    left: options.left,
    right: "optimized",
    optimized_position: optimizedPosition,
    blind_mapping: blindMapping,
    created_at: new Date().toISOString(),
    note: "Coordinator-only metadata. Keep this file away from reviewers."
  };
  await mkdir(pairDir, { recursive: true });
  await writeFile(path.join(pairDir, "mapping.json"), JSON.stringify(mapping, null, 2) + "\n", "utf8");
  return { pairDir, mapping };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/prepare-efficiency-pair.mjs --study-id <id> --pair-id <id> --task-id <id> --repetition <n> --snapshot <dir> [--left legacy|baseline] [--legacy-root <dir>] [--runs-dir <dir>]");
    return;
  }
  const result = await prepareEfficiencyPair(options);
  console.log("Created " + result.pairDir);
  console.log("Optimized is Candidate " + result.mapping.optimized_position + "; left condition is " + options.left + ".");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Efficiency pair preparation failed: " + error.message);
    process.exitCode = 1;
  });
}
