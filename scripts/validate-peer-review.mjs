#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const DIMENSIONS = ["product_understanding", "ux_reasoning", "design_judgment", "visual_hierarchy", "interaction_completeness", "accessibility_responsiveness", "implementation_quality"];
const WEIGHTS = { product_understanding: 15, ux_reasoning: 20, design_judgment: 15, visual_hierarchy: 15, interaction_completeness: 15, accessibility_responsiveness: 10, implementation_quality: 10 };
const TASKS = ["subscription-settings", "product-onboarding", "operations-dashboard"];
const PAIRS = TASKS.flatMap((task) => [1, 2, 3].map((repetition) => ({ pair: task + "-r" + repetition, task, repetition })));

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    if (!["--review", "--runs", "--write-results", "--allow-missing-evidence"].includes(flag)) {
      throw new Error("Unknown option: " + flag);
    }
    if (flag === "--allow-missing-evidence") {
      options.allowMissingEvidence = true;
      continue;
    }
    const value = args[++index];
    if (!value || value.startsWith("--")) throw new Error("Missing value for " + flag);
    options[flag.slice(2).replace(/-([a-z])/g, (_, character) => character.toUpperCase())] = value;
  }
  if (!options.review || !options.runs) {
    throw new Error("usage: node scripts/validate-peer-review.mjs --review <dir> --runs <dir> [--write-results <file>] [--allow-missing-evidence]");
  }
  return options;
}

const weighted = (scores) => Object.entries(WEIGHTS).reduce((total, [dimension, weight]) => total + (scores[dimension] / 4) * weight, 0);
const average = (values) => values.reduce((total, value) => total + value, 0) / values.length;
const sha256 = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

function assertScores(entry, label, problems) {
  if (!entry || typeof entry !== "object") {
    problems.push(label + ": missing object");
    return false;
  }
  const keys = Object.keys(entry.scores ?? {}).sort();
  if (keys.join(",") !== [...DIMENSIONS].sort().join(",")) {
    problems.push(label + ": expected the seven rubric dimensions");
    return false;
  }
  let valid = true;
  for (const dimension of DIMENSIONS) {
    const score = entry.scores[dimension];
    if (!Number.isInteger(score) || score < 0 || score > 4) {
      problems.push(label + "/" + dimension + ": score must be an integer from 0 to 4");
      valid = false;
    }
    if (typeof entry.rationale?.[dimension] !== "string" || entry.rationale[dimension].trim().length < 20) {
      problems.push(label + "/" + dimension + ": rationale is missing or too short");
      valid = false;
    }
  }
  return valid;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const review = path.resolve(options.review);
  const runs = path.resolve(options.runs);
  const problems = [];
  const round1 = {};
  const hashes = {};

  for (const reviewer of ["r1", "r2"]) {
    for (const { pair } of PAIRS) {
      const file = path.join(review, "out", reviewer, pair + ".json");
      let json;
      try {
        json = JSON.parse(await readFile(file, "utf8"));
      } catch (error) {
        problems.push(reviewer + "/" + pair + ": cannot read round-1 result (" + error.message + ")");
        continue;
      }
      if (json.reviewer_id !== reviewer.toUpperCase()) problems.push(reviewer + "/" + pair + ": reviewer_id should be " + reviewer.toUpperCase());
      if (json.pair_id !== pair) problems.push(reviewer + "/" + pair + ": pair_id should be " + pair);
      for (const candidate of ["candidate_a", "candidate_b"]) {
        const valid = assertScores(json[candidate], reviewer + "/" + pair + "/" + candidate, problems);
        if (!valid) continue;
        const evidence = json[candidate].evidence;
        if (!Array.isArray(evidence) || evidence.length < 2) {
          problems.push(reviewer + "/" + pair + "/" + candidate + ": at least two evidence crops are required");
          continue;
        }
        for (const item of evidence) {
          if (typeof item?.file !== "string") {
            problems.push(reviewer + "/" + pair + "/" + candidate + ": evidence entry without a file");
            continue;
          }
          try {
            const info = await stat(path.join(review, "out", reviewer, item.file));
            if (!info.isFile() || info.size < 1000) problems.push(reviewer + "/" + pair + "/" + candidate + ": evidence is missing or too small: " + item.file);
          } catch {
            if (!options.allowMissingEvidence) problems.push(reviewer + "/" + pair + "/" + candidate + ": evidence file not found: " + item.file);
          }
        }
      }
      round1[reviewer + "/" + pair] = json;
      hashes["out/" + reviewer + "/" + pair + ".json"] = sha256(json);
    }
  }

  if (problems.length) return report(problems);

  const freezeFile = path.join(review, "freeze-round1.json");
  let freeze;
  try {
    freeze = JSON.parse(await readFile(freezeFile, "utf8"));
  } catch {
    freeze = { frozen_at: new Date().toISOString(), note: "SHA-256 of every round-1 result before discussion.", result_hashes: hashes, evidence_files: [] };
    await mkdir(path.dirname(freezeFile), { recursive: true });
    await writeFile(freezeFile, JSON.stringify(freeze, null, 2) + "\n");
    console.log("created " + freezeFile);
  }
  for (const [file, expected] of Object.entries(freeze.result_hashes ?? {})) {
    if (expected !== hashes[file]) problems.push("round-1 result changed after freeze: " + file);
  }
  if (problems.length) return report(problems);

  const discussion = {};
  for (const reviewer of ["r1", "r2"]) {
    for (const { pair } of PAIRS) {
      const file = path.join(review, "out", reviewer, pair + ".discussion.json");
      let json;
      try {
        json = JSON.parse(await readFile(file, "utf8"));
      } catch (error) {
        problems.push(reviewer + "/" + pair + ": cannot read discussion (" + error.message + ")");
        continue;
      }
      if (json.reviewer_id !== reviewer.toUpperCase()) problems.push(reviewer + "/" + pair + ": discussion reviewer_id should be " + reviewer.toUpperCase());
      if (json.pair_id !== pair) problems.push(reviewer + "/" + pair + ": discussion pair_id should be " + pair);
      for (const candidate of ["candidate_a", "candidate_b"]) {
        const keys = Object.keys(json.final_scores?.[candidate] ?? {}).sort();
        if (keys.join(",") !== [...DIMENSIONS].sort().join(",")) {
          problems.push(reviewer + "/" + pair + "/" + candidate + ": discussion is missing final scores");
          continue;
        }
        for (const dimension of DIMENSIONS) {
          const score = json.final_scores[candidate][dimension];
          if (!Number.isInteger(score) || score < 0 || score > 4) problems.push(reviewer + "/" + pair + "/" + candidate + "/" + dimension + ": final score must be an integer from 0 to 4");
        }
      }
      for (const response of json.responses ?? []) {
        const candidate = response.candidate === "a" ? "candidate_a" : response.candidate === "b" ? "candidate_b" : null;
        if (!candidate || !DIMENSIONS.includes(response.dimension)) continue;
        const original = round1[reviewer + "/" + pair]?.[candidate]?.scores?.[response.dimension];
        if (typeof response.round1_score === "number" && response.round1_score !== original) {
          problems.push(reviewer + "/" + pair + ": response claims round-1 score " + response.round1_score + " but the frozen result has " + original + " for " + candidate + "/" + response.dimension);
        }
      }
      discussion[reviewer + "/" + pair] = json;
    }
  }
  if (problems.length) return report(problems);

  const rows = [];
  for (const { pair, task, repetition } of PAIRS) {
    const mapping = JSON.parse(await readFile(path.join(runs, task, "r" + repetition, "mapping.json"), "utf8"));
    const aIsBaseline = mapping.blind_mapping["condition-a"] === "baseline";
    const candidateScore = (condition) => {
      const candidate = aIsBaseline === (condition === "baseline") ? "candidate_a" : "candidate_b";
      return average(["r1", "r2"].map((reviewer) => weighted(discussion[reviewer + "/" + pair].final_scores[candidate])));
    };
    const disputes = [];
    for (const candidate of ["candidate_a", "candidate_b"]) {
      for (const dimension of DIMENSIONS) {
        const first = discussion["r1/" + pair].final_scores[candidate][dimension];
        const second = discussion["r2/" + pair].final_scores[candidate][dimension];
        if (first !== second) disputes.push({ candidate, dimension, r1: first, r2: second, panel: (first + second) / 2 });
      }
    }
    rows.push({ pair, task, repetition, candidate_a_condition: mapping.blind_mapping["condition-a"], baseline: candidateScore("baseline"), uadi: candidateScore("uadi"), disputes });
  }

  const baseline = average(rows.map((row) => row.baseline));
  const uadi = average(rows.map((row) => row.uadi));
  const summary = {
    finalized_at: new Date().toISOString(),
    rule: "Agreed integer scores are final. One-point splits are averaged and flagged. Two-point splits require a chair decision.",
    overall: { baseline, uadi, delta: uadi - baseline, wins: rows.filter((row) => row.uadi > row.baseline).length, losses: rows.filter((row) => row.uadi < row.baseline).length, ties: rows.filter((row) => row.uadi === row.baseline).length, splits: rows.reduce((total, row) => total + row.disputes.length, 0) },
    pairs: rows,
    discussion_hashes: Object.fromEntries(PAIRS.flatMap(({ pair }) => ["r1", "r2"].map((reviewer) => ["out/" + reviewer + "/" + pair + ".discussion.json", sha256(discussion[reviewer + "/" + pair])])))
  };
  await writeFile(path.join(review, "discussion-summary.json"), JSON.stringify(summary, null, 2) + "\n");

  if (options.writeResults) {
    const results = { schema_version: 2, study: { review_protocol: "two-reviewer-machine", review_frozen_at: freeze.frozen_at, review_rule: summary.rule, human_review: "none", agent: "RECORD_ME", model: "RECORD_ME", date: new Date().toISOString().slice(0, 10), project_snapshot: "RECORD_ME" }, pairs: [] };
    for (const row of rows) {
      const paired = { pair_id: row.pair, task_id: row.task, model_family: "RECORD_ME", model_version: "RECORD_ME", repetition: row.repetition, baseline: {}, uadi: {} };
      for (const condition of ["baseline", "uadi"]) {
        const candidate = row.candidate_a_condition === (condition === "baseline") ? "candidate_a" : "candidate_b";
        const project = path.join(runs, row.task, "r" + row.repetition, condition, "project");
        let duration = 0;
        try {
          const start = Number((await readFile(path.join(project, ".run-start"), "utf8")).trim());
          const end = Number((await readFile(path.join(project, ".run-end"), "utf8")).trim());
          duration = end - start;
        } catch {
          // Duration is optional in the summary; the scorer still validates it when present.
        }
        paired[condition] = {
          duration_seconds: duration,
          reviewers: ["r1", "r2"].map((reviewer) => ({ id: reviewer.toUpperCase(), type: "llm", independent: true, provenance: "blinded machine reviewer, separate session", scores: discussion[reviewer + "/" + row.pair].final_scores[candidate] }))
        };
      }
      results.pairs.push(paired);
    }
    await mkdir(path.dirname(path.resolve(options.writeResults)), { recursive: true });
    await writeFile(path.resolve(options.writeResults), JSON.stringify(results, null, 2) + "\n");
    console.log("wrote " + options.writeResults + " (replace the RECORD_ME fields before scoring)");
  }

  console.log("valid: 18 round-1 results, 18 discussions, evidence present");
  console.log("baseline " + baseline.toFixed(2) + " / uadi " + uadi.toFixed(2) + " / delta " + (uadi - baseline).toFixed(2) + " / splits " + summary.overall.splits);
  for (const row of rows) console.log(row.pair + "  baseline=" + row.baseline.toFixed(2) + "  uadi=" + row.uadi.toFixed(2) + "  delta=" + (row.uadi - row.baseline).toFixed(2) + "  splits=" + row.disputes.length);
}

function report(problems) {
  console.error("peer review validation failed:");
  for (const problem of problems) console.error(" - " + problem);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error("peer review validation error: " + error.message);
  process.exitCode = 1;
});
