export const REQUIRED_GATES = Object.freeze([
  "INPUT_CONTEXT", "REQUIREMENT_COVERAGE", "DESIGN_QUALITY", "SCHEMA_ARTIFACT",
  "GOVERNANCE", "PROTOTYPE_RUNTIME", "UX_ACCESSIBILITY_VISUAL", "SECURITY_SAFETY",
  "HUMAN_APPROVAL", "PUBLISH_REGRESSION"
]);

const STATUSES = new Set(["PASS", "FAIL", "WARNING", "BLOCKED"]);
const sha256Pattern = /^[a-f0-9]{64}$/i;
const REQUIRED_EVALUATORS = {
  SCHEMA_ARTIFACT: ["RULE_ENGINE"],
  GOVERNANCE: ["RULE_ENGINE"],
  PROTOTYPE_RUNTIME: ["TEST_RUNNER"],
  UX_ACCESSIBILITY_VISUAL: ["TEST_RUNNER", "HUMAN"],
  SECURITY_SAFETY: ["SECURITY_SCANNER", "HUMAN"],
  HUMAN_APPROVAL: ["HOST_IDENTITY"],
  PUBLISH_REGRESSION: ["RULE_ENGINE", "TEST_RUNNER"]
};

export function evaluateGate({ gateId, artifactId, artifactVersion, artifactSha256, evaluator, checks, evaluatedAt = new Date().toISOString(), evidence = [] }) {
  if (!REQUIRED_GATES.includes(gateId)) throw new Error(`unknown gate: ${gateId}`);
  if (!artifactId || !Number.isInteger(artifactVersion) || artifactVersion < 1) throw new Error("artifact identity and positive version are required");
  if (!sha256Pattern.test(artifactSha256 ?? "")) throw new Error("artifactSha256 must be a SHA-256 hex digest");
  if (!["RULE_ENGINE", "TEST_RUNNER", "HUMAN", "HOST_IDENTITY", "SECURITY_SCANNER"].includes(evaluator)) throw new Error("unsupported evaluator");
  if (REQUIRED_EVALUATORS[gateId] && !REQUIRED_EVALUATORS[gateId].includes(evaluator)) throw new Error(`gate ${gateId} requires a trusted evaluator: ${REQUIRED_EVALUATORS[gateId].join(" or ")}`);
  if (!Array.isArray(checks) || checks.length === 0) throw new Error("at least one check is required");
  const ids = new Set();
  for (const check of checks) {
    if (!check?.checkId || ids.has(check.checkId)) throw new Error("check IDs must be present and unique");
    if (!STATUSES.has(check.status)) throw new Error(`invalid status for check ${check.checkId}`);
    if (!check.message?.trim()) throw new Error(`check ${check.checkId} requires a message`);
    ids.add(check.checkId);
  }
  if (gateId === "HUMAN_APPROVAL") {
    for (const id of ["authenticated-owner", "exact-proposal-version"]) {
      if (!ids.has(id) || checks.find((item) => item.checkId === id)?.status !== "PASS") throw new Error(`human approval gate requires passing ${id} check`);
    }
  }
  const status = checks.some((x) => x.status === "BLOCKED") ? "BLOCKED"
    : checks.some((x) => x.status === "FAIL") ? "FAIL"
    : checks.some((x) => x.status === "WARNING") ? "WARNING" : "PASS";
  return Object.freeze({
    gateId, status, artifactId, artifactVersion, artifactSha256, evaluator,
    checks: checks.map((x) => Object.freeze({ ...x, evidence: [...(x.evidence ?? [])] })),
    evidence: [...evidence], evaluatedAt
  });
}

export function evaluateRelease({ gateResults, artifactId, artifactVersion, artifactSha256, allowWarnings = false, verifyAttestation }) {
  const errors = [];
  const byGate = new Map();
  if (!Array.isArray(gateResults)) errors.push("gateResults must be an array");
  for (const result of Array.isArray(gateResults) ? gateResults : []) {
    if (!REQUIRED_GATES.includes(result?.gateId)) {
      errors.push(`unknown gate result: ${result?.gateId ?? "missing gateId"}`);
      continue;
    }
    if (byGate.has(result.gateId)) errors.push(`duplicate gate result: ${result.gateId}`);
    byGate.set(result.gateId, result);
    if (result.artifactId !== artifactId || result.artifactVersion !== artifactVersion || result.artifactSha256 !== artifactSha256) {
      errors.push(`stale or mismatched evidence for gate ${result.gateId}`);
    }
    if (!result.attestation || typeof verifyAttestation !== "function" || !verifyAttestation(result)) {
      errors.push(`missing or invalid trusted attestation for gate ${result.gateId}`);
    }
  }
  for (const gateId of REQUIRED_GATES) {
    const result = byGate.get(gateId);
    if (!result) errors.push(`missing required gate: ${gateId}`);
    else if (result.status !== "PASS" && !(allowWarnings && result.status === "WARNING")) errors.push(`gate ${gateId} is ${result.status}, not releasable`);
  }
  return { ready: errors.length === 0, errors, evaluatedGateCount: byGate.size, requiredGateCount: REQUIRED_GATES.length };
}
