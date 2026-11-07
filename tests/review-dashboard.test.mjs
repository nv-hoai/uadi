import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildReviewDashboard, loadReviewData } from "../scripts/build-review-dashboard.mjs";

const DIMENSIONS = ["product_understanding", "ux_reasoning", "design_judgment", "visual_hierarchy", "interaction_completeness", "accessibility_responsiveness", "implementation_quality"];
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lK3Q6wAAAABJRU5ErkJggg==", "base64");

function scores(value) {
  return Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, value]));
}

function reviewer(prefix, candidate) {
  return {
    reviewer_id: prefix.toUpperCase(),
    pair_id: "product-onboarding-r1",
    blind: true,
    [candidate]: {
      scores: scores(candidate === "candidate_a" ? 4 : 3),
      rationale: Object.fromEntries(DIMENSIONS.map((dimension) => [dimension, "Concrete evidence for " + dimension + " in this fixture."])),
      evidence: [{ file: "evidence/product-onboarding-r1/" + (candidate === "candidate_a" ? "a" : "b") + "/crop.png", caption: "Fixture crop", dimension: "visual_hierarchy" }],
      critical_defects: ["Fixture defect"],
      strengths: ["Fixture strength"]
    },
    comparison: "Fixture comparison.",
    limitations: "Fixture limitation."
  };
}

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "uadi-dashboard-"));
  const review = path.join(root, "review");
  for (const id of ["r1", "r2"]) {
    const base = path.join(review, "out", id);
    await mkdir(path.join(base, "evidence", "product-onboarding-r1", "a"), { recursive: true });
    await mkdir(path.join(base, "evidence", "product-onboarding-r1", "b"), { recursive: true });
    const round = reviewer(id, "candidate_a");
    round.candidate_b = reviewer(id, "candidate_b").candidate_b;
    await writeFile(path.join(base, "product-onboarding-r1.json"), JSON.stringify(round, null, 2));
    await writeFile(path.join(base, "product-onboarding-r1.discussion.json"), JSON.stringify({
      reviewer_id: id.toUpperCase(),
      pair_id: "product-onboarding-r1",
      round: 2,
      counterpart: id === "r1" ? "R2" : "R1",
      responses: [],
      final_scores: { candidate_a: scores(4), candidate_b: scores(3) },
      differences_remaining: [],
      summary: "Fixture discussion."
    }, null, 2));
    await writeFile(path.join(base, "evidence", "product-onboarding-r1", "a", "crop.png"), PNG);
    await writeFile(path.join(base, "evidence", "product-onboarding-r1", "b", "crop.png"), PNG);
  }
  await writeFile(path.join(review, "freeze-round1.json"), JSON.stringify({ frozen_at: "2026-01-01T00:00:00.000Z" }));
  await writeFile(path.join(review, "discussion-summary.json"), JSON.stringify({
    finalized_at: "2026-01-01T01:00:00.000Z",
    rule: "Fixture rule.",
    overall: { baseline: 75, uadi: 100, delta: 25, wins: 1, losses: 0, ties: 0, splits: 0 },
    pairs: [{
      pair: "product-onboarding-r1",
      task: "product-onboarding",
      repetition: 1,
      candidate_a_condition: "uadi",
      baseline: 75,
      uadi: 100,
      disputes: []
    }],
    discussion_hashes: {}
  }, null, 2));
  return { root, review };
}

test("loads a review directory into dashboard data", async () => {
  const { root, review } = await fixture();
  try {
    const data = await loadReviewData(review);
    assert.equal(data.pairs.length, 1);
    assert.equal(data.pairs[0].taskLabel, "First-run onboarding");
    assert.equal(data.pairs[0].aCondition, "uadi");
    assert.equal(data.pairs[0].baseline, 75);
    assert.equal(data.pairs[0].uadi, 100);
    assert.equal(data.pairs[0].delta, 25);
    assert.equal(data.overall.evidence, 4);
    assert.equal(data.overall.splits, 0);
    assert.equal(data.dimensions.length, 7);
    assert.equal(data.position.a.pairs.length, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("builds a reusable dashboard with relative evidence links", async () => {
  const { root, review } = await fixture();
  try {
    const out = path.join(root, "dashboard.html");
    const result = await buildReviewDashboard({ review, out, title: "Fixture dashboard", status: "Machine-reviewed fixture" });
    assert.equal(result.out, out);
    const html = await readFile(out, "utf8");
    assert.match(html, /Fixture dashboard/);
    assert.match(html, /Machine-reviewed fixture/);
    assert.match(html, /review\/out\/r1\/evidence\/product-onboarding-r1\/a\/crop\.png/);
    assert.match(html, /review\/out\/r1\/product-onboarding-r1\.json/);
    assert.match(html, /First-run onboarding/);
    assert.doesNotMatch(html, /undefined/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
