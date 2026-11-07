#!/usr/bin/env node
// Prepares blinded judge packets for the confirmatory study.
//
// For each pair: judge-passes/<pair_id>/<reviewer>/inputs/ containing
// task.md, condition-a/ and condition-b/ (sanitized copies of the two
// run deliverables; .agents, transcripts and run markers removed, paths
// redacted). The coordinator-only mapping stays outside the pass dirs.
//
// For calibration: judge-passes/calibration/<packet>/<reviewer>/inputs/
// containing candidate/ and brief.md (the packet's deliverable + a neutral
// task framing, manifest withheld).
//
// The JUDGE-PROMPT is copied verbatim into every pass's instructions.md.
// Judges write result.json into their pass root — never into inputs/.
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RUNS = path.join(ROOT, "benchmarks/runs/confirmatory-2026-11");
const PASSES = path.join(RUNS, "judge-passes");
const DESIGN = path.join(ROOT, "benchmarks/studies/confirmatory-2026-11/study-design.json");
const JUDGE_PROMPT = path.join(ROOT, "benchmarks/JUDGE-PROMPT.md");

const IDENTITY_WORDS = ["deepseek", "muse-spark", "deepseek-v4", "muse-spark-1.3", "opencode-go", "opencode", ".agents", "UADI", "uadi"];

async function sanitizeText(text, source) {
  let hits = 0;
  for (const word of IDENTITY_WORDS) {
    const count = text.split(word).length - 1;
    if (count > 0) { hits += count; text = text.split(word).join("[redacted]"); }
  }
  return { text, hits };
}

async function buildPacket(sourceDir, destDir) {
  const report = [];
  await rm(destDir, { recursive: true, force: true });
  await mkdir(destDir, { recursive: true });
  const entries = await readdir(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "transcript.md") continue;
    const source = path.join(sourceDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "screenshots" || entry.name === "test-output" || entry.name === "changed-files") {
        await cp(source, dest, { recursive: true });
        continue;
      }
      // nested dirs (e.g. none expected) — copy recursively
      await cp(source, dest, { recursive: true });
      continue;
    }
    if (entry.isFile() && /\.(md|html|js|css|json|log)$/.test(entry.name)) {
      const original = await readFile(source, "utf8");
      // redact absolute repo paths
      const redacted = original.replaceAll(ROOT, "<project>");
      const { text, hits } = await sanitizeText(redacted);
      if (hits > 0) report.push({ file: entry.name, identity_hits: hits });
      await writeFile(dest, text);
    } else {
      await cp(source, dest);
    }
  }
  return report;
}

const DIMENSIONS = [
  ["product_understanding", 15],
  ["ux_reasoning", 20],
  ["design_judgment", 15],
  ["visual_hierarchy", 15],
  ["interaction_completeness", 15],
  ["accessibility_responsiveness", 10],
  ["implementation_quality", 10]
];

function instructions(pairId, reviewerId) {
  return `Task ${pairId} as Candidate A and Candidate B. Score each candidate independently.

## Packet layout

- inputs/task.md — the task brief.
- inputs/condition-a/ and inputs/condition-b/ — respectively, each candidate's project/ (index.html, styles.css, app.js, analysis.md) and evidence/ (screenshots/ at two viewports, test-output/, quality-gates.json).

## Dimensions (0–4) and weights

${DIMENSIONS.map(([name, weight]) => `- ${name}: ${weight}`).join("\n")}

## result.json shape

Write result.json in your pass root with exactly this shape:

{
  "reviewer_id": "${reviewerId}",
  "pair_id": "${pairId}",
  "candidate_a": { "scores": {"product_understanding":0,"ux_reasoning":0,"design_judgment":0,"visual_hierarchy":0,"interaction_completeness":0,"accessibility_responsiveness":0,"implementation_quality":0}, "rationale": {"<dimension>":"<citation>"}, "critical_defects": [], "strengths": [] },
  "candidate_b": { ... same keys ... },
  "verdict": "<short comparison using only Candidate A / Candidate B>",
  "limitations": "<note>"
}

View the screenshots inside inputs/condition-*/screenshots/ yourself (read tool).
`;
}

async function main() {
  const design = JSON.parse(await readFile(DESIGN, "utf8"));
  const judgePrompt = await readFile(JUDGE_PROMPT, "utf8");
  const reviewerIds = design.review.reviewer_families.map((entry, index) => "R" + (index + 1));

  const sanitization = [];
  for (const pair of design.design.pairs) {
    const pairDir = path.join(RUNS, pair.pair_id);
    const mapping = JSON.parse(await readFile(path.join(pairDir, "mapping.json"), "utf8"));
    for (const reviewer of design.review.reviewer_families) {
      const reviewerId = reviewerIds[design.review.reviewer_families.indexOf(reviewer)];
      const passDir = path.join(PASSES, pair.pair_id, reviewerId);
      const inputs = path.join(passDir, "inputs");
      await rm(passDir, { recursive: true, force: true });
      await mkdir(inputs, { recursive: true });
      await cp(path.join(ROOT, "benchmarks/tasks/" + pair.task_id + ".md"), path.join(inputs, "task.md"));
      for (const letter of ["a", "b"]) {
        const condition = mapping.blind_mapping["condition-" + letter];
        const source = path.join(pairDir, condition, "project");
        const report = await buildPacket(source, path.join(inputs, "condition-" + letter, "project"));
        sanitization.push({ pair: pair.pair_id, reviewer: reviewerId, condition: letter, hits: report.reduce((n, r) => n + r.identity_hits, 0) });
        const evidenceSource = path.join(pairDir, condition, "evidence");
        await cp(evidenceSource, path.join(inputs, "condition-" + letter, "evidence"), { recursive: true });
      }
      await writeFile(path.join(passDir, "instructions.md"), judgePrompt + "\n\n---\n\n" + instructions(pair.pair_id, reviewerId));
    }
  }

  // Calibration passes: one candidate per packet.
  const calibrationDir = path.join(ROOT, "benchmarks/studies/confirmatory-2026-11/calibration");
  const manifest = JSON.parse(await readFile(path.join(calibrationDir, "calibration-manifest.json"), "utf8"));
  for (const packet of manifest.packets) {
    for (const reviewer of design.review.reviewer_families) {
      const reviewerId = reviewerIds[design.review.reviewer_families.indexOf(reviewer)];
      const passDir = path.join(PASSES, "calibration", packet.id, reviewerId);
      const inputs = path.join(passDir, "inputs");
      await rm(passDir, { recursive: true, force: true });
      await mkdir(inputs, { recursive: true });
      await writeFile(path.join(inputs, "brief.md"), "# Review task\n\nGrade the single candidate in inputs/candidate/ on the seven rubric dimensions. There is no comparator. Report each dimension score (0–4), a short rationale with file citations, any critical defects found, and whether you found at least one critical defect. Blind: do not speculate about provenance.\n");
      await buildPacket(path.join(calibrationDir, packet.id), path.join(inputs, "candidate"));
      await writeFile(path.join(passDir, "instructions.md"), judgePrompt + "\n\n---\n\n" + instructions(packet.id, reviewerId) + "\nNote: this calibration pass contains a single candidate (inputs/candidate/). Grade it on all seven dimensions; the comparison is against the rubric, not another candidate.\n");
    }
  }

  await writeFile(path.join(RUNS, "judge-passes/sanitization-report.json"), JSON.stringify(sanitization, null, 2));
  const flagged = sanitization.filter((s) => s.hits > 0);
  console.log("Packed " + design.design.pairs.length + " pairs x " + reviewerIds.length + " reviewers, " +
    manifest.packets.length + " calibration packets x " + reviewerIds.length + " reviewers");
  console.log("Sanitization flagged " + flagged.length + " packets with identity-word redactions of " + flagged.reduce((n, s) => n + s.hits, 0) + " occurrences total");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error("Packet preparation failed: " + error.message); process.exitCode = 1; });
}
