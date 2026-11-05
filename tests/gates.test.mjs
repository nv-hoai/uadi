import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { REQUIRED_GATES, evaluateGate, evaluateRelease } from "../runtime/gates.mjs";
import { canonicalGatePayload, verifyGateAttestation } from "../runtime/attestation.mjs";
import { createEvidenceRecord, appendEvidence, verifyEvidenceForArtifact, summarizeEvidence } from "../runtime/evidence-ledger.mjs";
import { evaluateQuality } from "../runtime/quality-evaluation.mjs";
import { inspectGeneratedSource } from "../runtime/security-inspection.mjs";
import { detectDesignDrift } from "../runtime/design-drift.mjs";

const sha = "a".repeat(64);
const artifact = { artifactId: "proposal-1", version: 2, artifactVersion: 2, contentSha256: sha, artifactSha256: sha };
const evaluatorFor = (gateId) => ({
  SCHEMA_ARTIFACT: "RULE_ENGINE", GOVERNANCE: "RULE_ENGINE", PROTOTYPE_RUNTIME: "TEST_RUNNER",
  UX_ACCESSIBILITY_VISUAL: "TEST_RUNNER", SECURITY_SAFETY: "SECURITY_SCANNER",
  HUMAN_APPROVAL: "HOST_IDENTITY", PUBLISH_REGRESSION: "RULE_ENGINE"
}[gateId] ?? "HUMAN");
const signResult = (result, privateKey) => ({
  ...result,
  attestation: { algorithm: "Ed25519", keyId: "test-key", signature: sign(null, Buffer.from(canonicalGatePayload(result)), privateKey).toString("base64") }
});
const makeGates = (privateKey) => REQUIRED_GATES.map((gateId) => {
  const checks = gateId === "HUMAN_APPROVAL"
    ? [{ checkId: "authenticated-owner", status: "PASS", message: "owner identity verified" }, { checkId: "exact-proposal-version", status: "PASS", message: "approval matches proposal revision" }]
    : [{ checkId: "baseline", status: "PASS", message: "check passed" }];
  return signResult(evaluateGate({
    gateId, artifactId: artifact.artifactId, artifactVersion: artifact.version, artifactSha256: sha,
    evaluator: evaluatorFor(gateId), checks
  }), privateKey);
});
const keys = generateKeyPairSync("ed25519");
const verify = (result) => verifyGateAttestation(result, { publicKey: keys.publicKey, expectedKeyId: "test-key" });

test("release requires all ten signed gates bound to the exact artifact revision", () => {
  const gateResults = makeGates(keys.privateKey);
  assert.equal(evaluateRelease({ gateResults, ...artifact, verifyAttestation: verify }).ready, true);
  assert.equal(evaluateRelease({ gateResults, ...artifact }).ready, false, "unsigned verification must fail closed");
  const missing = gateResults.slice(1);
  assert.equal(evaluateRelease({ gateResults: missing, ...artifact, verifyAttestation: verify }).ready, false);
  const stale = makeGates(keys.privateKey);
  stale[0] = { ...stale[0], artifactVersion: 1 };
  assert.equal(evaluateRelease({ gateResults: stale, ...artifact, verifyAttestation: verify }).ready, false);
});
test("Ed25519 attestation rejects tampered gate results and untrusted key IDs", () => {
  const result = evaluateGate({ gateId: "SCHEMA_ARTIFACT", artifactId: artifact.artifactId, artifactVersion: 2, artifactSha256: sha, evaluator: "RULE_ENGINE", checks: [{ checkId: "schema", status: "PASS", message: "schema valid" }] });
  const signed = signResult(result, keys.privateKey);
  assert.equal(verify(signed), true);
  assert.equal(verify({ ...signed, status: "FAIL" }), false);
  assert.equal(verifyGateAttestation(signed, { publicKey: keys.publicKey, expectedKeyId: "wrong-key" }), false);
});
test("gate evaluator and human approval checks are constrained", () => {
  assert.throws(() => evaluateGate({ gateId: "PROTOTYPE_RUNTIME", artifactId: artifact.artifactId, artifactVersion: 2, artifactSha256: sha, evaluator: "HUMAN", checks: [{ checkId: "build", status: "PASS", message: "built" }] }), /trusted evaluator/);
  assert.throws(() => evaluateGate({ gateId: "HUMAN_APPROVAL", artifactId: artifact.artifactId, artifactVersion: 2, artifactSha256: sha, evaluator: "HOST_IDENTITY", checks: [{ checkId: "approved", status: "PASS", message: "approved" }] }), /authenticated-owner/);
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
