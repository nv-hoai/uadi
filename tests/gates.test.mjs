import test from "node:test";
import assert from "node:assert/strict";
import { REQUIRED_GATES, evaluateGate, evaluateRelease } from "../runtime/gates.mjs";
import { createEvidenceRecord, appendEvidence, verifyEvidenceForArtifact, summarizeEvidence } from "../runtime/evidence-ledger.mjs";
import { evaluateQuality } from "../runtime/quality-evaluation.mjs";
import { inspectGeneratedSource } from "../runtime/security-inspection.mjs";
import { detectDesignDrift } from "../runtime/design-drift.mjs";

const sha = "a".repeat(64);
const artifact = { artifactId: "proposal-1", version: 2, contentSha256: sha, artifactSha256: sha };
const makeGates = () => REQUIRED_GATES.map((gateId) => evaluateGate({
  gateId, artifactId: artifact.artifactId, artifactVersion: artifact.version, artifactSha256: sha,
  evaluator: "RULE_ENGINE", checks: [{ checkId: "baseline", status: "PASS", message: "check passed" }]
}));

test("release requires all ten passing gates bound to the exact artifact revision", () => {
  assert.equal(evaluateRelease({ gateResults: makeGates(), ...artifact }).ready, true);
  const missing = makeGates().slice(1);
  assert.equal(evaluateRelease({ gateResults: missing, ...artifact }).ready, false);
  const stale = makeGates();
  stale[0] = { ...stale[0], artifactVersion: 1 };
  assert.equal(evaluateRelease({ gateResults: stale, ...artifact }).ready, false);
});
test("gate result status is derived from independent checks", () => {
  const result = evaluateGate({ gateId: "SECURITY_SAFETY", artifactId: artifact.artifactId, artifactVersion: 2, artifactSha256: sha, evaluator: "SECURITY_SCANNER", checks: [
    { checkId: "secrets", status: "PASS", message: "no secrets detected" },
    { checkId: "sandbox", status: "BLOCKED", message: "isolated runtime unavailable" }
  ] });
  assert.equal(result.status, "BLOCKED");
});
test("evidence ledger is append-only and bound to artifact digest", () => {
  const record = createEvidenceRecord({ evidenceId: "ev-1", gateId: "SCHEMA_ARTIFACT", artifactId: artifact.artifactId, artifactVersion: 2, artifactSha256: sha, evaluator: "RULE_ENGINE", outcome: "PASS", observedAt: "2026-10-01T00:00:00Z", runId: "ci-1", checks: [{ id: "schema", result: "pass" }] });
  assert.equal(verifyEvidenceForArtifact(record, artifact), true);
  assert.equal(appendEvidence([], record).length, 1);
  assert.throws(() => appendEvidence([record], record), /append-only/);
  assert.deepEqual(summarizeEvidence([record]), { total: 1, pass: 1, fail: 0, warning: 0, blocked: 0 });
});
test("quality score requires evidence and configurable minimum thresholds", () => {
  const result = evaluateQuality({ dimensions: [
    { id: "usability", weight: 2, score: 4, evidence: ["test:keyboard"] },
    { id: "consistency", weight: 1, score: 3, evidence: ["review:tokens"] }
  ] });
  assert.equal(result.passed, true);
  assert.equal(result.score, 3.67);
  const unsupported = evaluateQuality({ dimensions: [{ id: "ux", weight: 1, score: 5, evidence: [] }] });
  assert.equal(unsupported.passed, false);
});
test("security inspection blocks detected secrets and flags risky primitives for review", () => {
  assert.equal(inspectGeneratedSource("const x = 'AKIA1234567890ABCDEF';").passed, false);
  const review = inspectGeneratedSource("fetch('/api');");
  assert.equal(review.passed, true);
  assert.equal(review.requiresSecurityReview, true);
});
test("design drift distinguishes protected, warning and informational changes", () => {
  const report = detectDesignDrift({
    approved: { config_id: "approved-1", tokens: { color: "blue" }, accessibility: { contrast: "AA" } },
    candidate: { config_id: "candidate-2", tokens: { color: "red" }, accessibility: { contrast: "A" }, layout: "wide" },
    protectedPaths: ["accessibility.contrast"], warningPaths: ["tokens.color"]
  });
  assert.equal(report.hasBlockingDrift, true);
  assert.equal(report.hasWarnings, true);
  assert.equal(report.changeCount, 3);
});
