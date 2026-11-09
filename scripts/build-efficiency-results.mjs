#!/usr/bin/env node
// Build a scorer-compatible results.json from blinded efficiency review passes.
//
// B/C conventions: condition "legacy" is baseline, "optimized" is uadi.
// Reviewer candidates A/B are mapped through each pair's coordinator mapping.
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function weightedDuration(start, end) {
  const a = Number(start);
  const b = Number(end);
  return Number.isFinite(a) && Number.isFinite(b) && b > a ? b - a : 1;
}

function reviewer(entry) {
  return {
    id: entry.reviewer_id,
    type: "llm",
    independent: true,
    provenance: "blinded machine reviewer, separate session; packet includes FILES.txt",
    scores: entry.scores,
    rationale: entry.rationale,
    critical_defects: entry.critical_defects ?? []
  };
}

async function main() {
  const studyId = process.argv[2] ?? "efficiency-bc-2026-11";
  const runsDir = path.join(ROOT, "benchmarks/runs", studyId);
  const studyDir = path.join(ROOT, "benchmarks/studies", studyId);
  const pairs = [];
  for (const pairId of (await readdir(runsDir, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()) {
    const mapping = JSON.parse(await readFile(path.join(runsDir, pairId, "mapping.json"), "utf8"));
    const resultFor = async (reviewerId) => JSON.parse(await readFile(path.join(studyDir, "review", pairId, reviewerId, "result.json"), "utf8"));
    const r1 = await resultFor("r1");
    const r2 = await resultFor("r2");
    const candidate = (letter, result) => ({ reviewer_id: result.reviewer_id, ...result["candidate_" + letter] });
    const conditionOf = (letter) => mapping.blind_mapping["condition-" + letter];
    const build = async (condition) => {
      const side = condition === "optimized" ? "right" : "left";
      const project = path.join(runsDir, pairId, side, "project");
      const start = await readFile(path.join(project, ".run-start"), "utf8").catch(() => "0");
      const end = await readFile(path.join(project, ".run-end"), "utf8").catch(() => "0");
      return {
        duration_seconds: weightedDuration(start.trim(), end.trim()),
        reviewers: [candidate("a", r1), candidate("b", r1), candidate("a", r2), candidate("b", r2)]
          .filter((entry, index) => {
            const letter = index % 2 === 0 ? "a" : "b";
            return conditionOf(letter) === condition;
          })
          .filter((entry, index, list) => list.findIndex((other) => other.reviewer_id === entry.reviewer_id) === index)
          .map(reviewer)
      };
    };
    const conditions = ["legacy", "optimized"].filter((condition) => Object.values(mapping.blind_mapping).includes(condition));
    if (conditions.length !== 2) throw new Error("Unsupported mapping in " + pairId);
    const baselineCondition = conditions.includes("legacy") ? "legacy" : "baseline";
    pairs.push({
      pair_id: pairId,
      task_id: mapping.task_id,
      model_family: "deepseek",
      model_version: "deepseek-v4.1-flash",
      repetition: mapping.repetition,
      uadi_position: mapping.optimized_position,
      baseline_run_position: 1,
      baseline: await build(baselineCondition),
      uadi: await build("optimized")
    });
  }
  const results = {
    schema_version: 2,
    study: {
      agent: "OpenCode subagent",
      model: "deepseek-v4.1-flash",
      date: "2026-11-08",
      project_snapshot: "benchmarks/runs/design-intelligence-pilot-2026-11/snapshot",
      review_protocol: "two-reviewer-machine",
      design_type: "efficiency-pilot",
      conditions: "B (legacy skill) vs C (optimized runtime)"
    },
    pairs
  };
  await writeFile(path.join(studyDir, "results.json"), JSON.stringify(results, null, 2) + "\n", "utf8");
  console.log("Wrote " + path.join(studyDir, "results.json") + " (" + pairs.length + " pairs)");
}

main().catch((error) => {
  console.error("Build efficiency results failed: " + error.message);
  process.exitCode = 1;
});
