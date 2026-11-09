#!/usr/bin/env node
// Prepare blinded reviewer packets for a B/C (or A/C) efficiency study.
//
// Each pass gets inputs/task.md plus Candidate A/B project and evidence copies.
// Condition names, skill paths, model names and absolute repository paths are
// redacted. The coordinator-only mapping stays outside the pass directory.
//
// Usage:
//   node scripts/prepare-efficiency-review.mjs --study efficiency-bc-2026-11
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REVIEWERS = ["r1", "r2"];
const IDENTITY_WORDS = ["UADI", "uadi", ".agents", "legacy", "optimized", "Stage 0", "Stage 2", "deepseek", "opencode-go", "mapping.json"];

function parseArgs(args) {
  const options = { study: null };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--study") options.study = args[++index];
    else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error("Unknown option: " + arg);
  }
  if (!options.help && !options.study) throw new Error("--study is required");
  return options;
}

function sanitize(text) {
  let output = text.replaceAll(ROOT, "<repository>");
  for (const word of IDENTITY_WORDS) output = output.split(word).join("[redacted]");
  return output;
}

async function copySanitized(source, destination) {
  const info = await readFile(source).catch(() => null);
  if (info && /\.(md|html|js|css|json|txt)$/.test(source)) {
    await writeFile(destination, sanitize(info.toString("utf8")), "utf8");
  } else {
    await cp(source, destination);
  }
}

async function copyTree(source, destination, options = {}) {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    if (options.exclude?.some((name) => entry.name === name)) continue;
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) await copyTree(from, to, options);
    else if (entry.isFile()) await copySanitized(from, to);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/prepare-efficiency-review.mjs --study <study-id>");
    return;
  }
  const studyDir = path.join(ROOT, "benchmarks/studies", options.study);
  const runsDir = path.join(ROOT, "benchmarks/runs", options.study);
  const pairs = (await readdir(runsDir, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  const judgePrompt = await readFile(path.join(ROOT, "benchmarks/JUDGE-PROMPT.md"), "utf8");

  for (const pair of pairs) {
    const pairDir = path.join(runsDir, pair);
    const mapping = JSON.parse(await readFile(path.join(pairDir, "mapping.json"), "utf8"));
    for (const reviewer of REVIEWERS) {
      const passDir = path.join(studyDir, "review", pair, reviewer);
      const inputs = path.join(passDir, "inputs");
      await rm(inputs, { recursive: true, force: true });
      await mkdir(inputs, { recursive: true });
      await cp(path.join(ROOT, "benchmarks/tasks", mapping.task_id + ".md"), path.join(inputs, "task.md"));
      for (const letter of ["a", "b"]) {
        const condition = mapping.blind_mapping["condition-" + letter];
        const sourceDir = path.join(pairDir, condition === "optimized" ? "right" : "left");
        await copyTree(path.join(sourceDir, "project"), path.join(inputs, "condition-" + letter, "project"), {
          exclude: [".agents", "prompt.md", "transcript.md", ".run-start", ".run-end"]
        });
        await copyTree(path.join(sourceDir, "evidence"), path.join(inputs, "condition-" + letter, "evidence"));
      }
      const instructions = `${judgePrompt}

---

## Pair

Pair id: \`${pair}\`
Task: \`${mapping.task_id}\`

Read \`inputs/task.md\`, then inspect \`inputs/condition-a/project\`, \`inputs/condition-a/evidence\`, \`inputs/condition-b/project\` and \`inputs/condition-b/evidence\`. View the screenshots directly. Evidence includes \`capture-report.json\` (which states were actually activated) and \`quality-gates.json\` (deterministic checks).

The exact file list is in \`FILES.txt\` at the pass root. Cite only paths from that list. If a screenshot or state is not in the list, say it is missing; do not invent a filename or a state image.

Write \`result.json\` in this pass root (not inside \`inputs/\`) with exactly:

{
  "reviewer_id": "${reviewer.toUpperCase()}",
  "pair_id": "${pair}",
  "candidate_a": {
    "scores": {"product_understanding":0,"ux_reasoning":0,"design_judgment":0,"visual_hierarchy":0,"interaction_completeness":0,"accessibility_responsiveness":0,"implementation_quality":0},
    "rationale": {"product_understanding":"citation","ux_reasoning":"citation","design_judgment":"citation","visual_hierarchy":"citation","interaction_completeness":"citation","accessibility_responsiveness":"citation","implementation_quality":"citation"},
    "critical_defects": [],
    "strengths": []
  },
  "candidate_b": { "scores": {}, "rationale": {}, "critical_defects": [], "strengths": [] },
  "verdict": "short comparison using only Candidate A and Candidate B",
  "limitations": "one note"
}

Score all seven dimensions unless the rendered evidence is not comparable; if it is not, say so explicitly instead of inventing a score.
`;
      const files = [];
      async function listFiles(dir, prefix = "") {
        for (const entry of await readdir(dir, { withFileTypes: true })) {
          const relative = prefix ? prefix + "/" + entry.name : entry.name;
          if (entry.isDirectory()) await listFiles(path.join(dir, entry.name), relative);
          else files.push(relative);
        }
      }
      await listFiles(inputs);
      await writeFile(path.join(passDir, "FILES.txt"), files.sort().join("\n") + "\n", "utf8");
      await writeFile(path.join(passDir, "instructions.md"), instructions, "utf8");
    }
  }
  console.log("Prepared " + pairs.length + " pairs x " + REVIEWERS.length + " reviewer packets in " + path.relative(ROOT, path.join(studyDir, "review")));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Review packet preparation failed: " + error.message);
    process.exitCode = 1;
  });
}
