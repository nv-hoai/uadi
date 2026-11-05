const isoDate = (value) => typeof value === "string" && !Number.isNaN(Date.parse(value));

export function createEvidenceRecord(input) {
  const required = ["evidenceId", "gateId", "artifactId", "artifactSha256", "evaluator", "outcome", "observedAt", "runId"];
  for (const key of required) if (!input?.[key]) throw new Error(`missing evidence field: ${key}`);
  if (!Number.isInteger(input.artifactVersion) || input.artifactVersion < 1) throw new Error("artifactVersion must be a positive integer");
  if (!/^[a-f0-9]{64}$/i.test(input.artifactSha256)) throw new Error("artifactSha256 must be a SHA-256 digest");
  if (!["PASS", "FAIL", "WARNING", "BLOCKED"].includes(input.outcome)) throw new Error("invalid evidence outcome");
  if (!isoDate(input.observedAt)) throw new Error("observedAt must be an ISO-compatible timestamp");
  if (!Array.isArray(input.checks) || input.checks.length === 0) throw new Error("evidence requires checks");
  return Object.freeze(structuredClone({ schemaVersion: "1.0.0", ...input }));
}

export function appendEvidence(records, record) {
  if (!Array.isArray(records)) throw new Error("evidence history must be an array");
  if (records.some((item) => item.evidenceId === record.evidenceId)) throw new Error("evidence records are append-only; evidenceId already exists");
  return [...records, record];
}

export function verifyEvidenceForArtifact(record, artifact) {
  return Boolean(record && artifact &&
    record.artifactId === artifact.artifactId &&
    record.artifactVersion === artifact.version &&
    record.artifactSha256 === artifact.contentSha256);
}

export function summarizeEvidence(records = []) {
  return records.reduce((summary, item) => {
    summary.total += 1;
    summary[item.outcome.toLowerCase()] += 1;
    return summary;
  }, { total: 0, pass: 0, fail: 0, warning: 0, blocked: 0 });
}
