const RULES = [
  { id: "private-key", severity: "BLOCK", pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i, message: "private key material detected" },
  { id: "github-token", severity: "BLOCK", pattern: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/, message: "GitHub token-like secret detected" },
  { id: "aws-access-key", severity: "BLOCK", pattern: /\bAKIA[0-9A-Z]{16}\b/, message: "AWS access-key identifier detected" },
  { id: "dynamic-code", severity: "REVIEW", pattern: /\b(?:eval\s*\(|new\s+Function\s*\()/, message: "dynamic code execution primitive detected" },
  { id: "process-execution", severity: "REVIEW", pattern: /(?:node:child_process|child_process|\bexecSync\s*\(|\bspawnSync\s*\()/, message: "process execution primitive detected" },
  { id: "filesystem-write", severity: "REVIEW", pattern: /(?:writeFileSync|createWriteStream|rmSync|unlinkSync)\s*\(/, message: "filesystem mutation primitive detected" },
  { id: "network-access", severity: "REVIEW", pattern: /(?:\bfetch\s*\(|new\s+WebSocket\s*\(|XMLHttpRequest)/, message: "network access primitive detected" }
];

export function inspectGeneratedSource(source) {
  if (typeof source !== "string") throw new Error("source must be a string");
  const findings = RULES.filter((rule) => rule.pattern.test(source)).map(({ id, severity, message }) => ({ id, severity, message }));
  return {
    passed: !findings.some((item) => item.severity === "BLOCK"),
    requiresSecurityReview: findings.some((item) => item.severity === "REVIEW"),
    findings,
    limitation: "Heuristic source inspection only. It is not a sandbox, proof of safety, or substitute for isolated execution and runtime policy."
  };
}
