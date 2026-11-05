const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const IDENTITY_FIELDS = new Set(["config_id", "version", "status", "created_at", "updated_at", "source", "supersedes"]);

function flatten(value, prefix = "", output = {}) {
  if (isObject(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (!prefix && IDENTITY_FIELDS.has(key)) continue;
      flatten(child, prefix ? `${prefix}.${key}` : key, output);
    }
  } else if (Array.isArray(value)) {
    value.forEach((child, index) => flatten(child, `${prefix}[${index}]`, output));
  } else output[prefix] = value;
  return output;
}

export function detectDesignDrift({ approved, candidate, protectedPaths = [], warningPaths = [] }) {
  if (!approved || !candidate) throw new Error("approved and candidate configurations are required");
  const before = flatten(approved);
  const after = flatten(candidate);
  const paths = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changes = [];
  for (const path of paths) {
    if (JSON.stringify(before[path]) === JSON.stringify(after[path])) continue;
    const protectedRule = protectedPaths.find((item) => path === item || path.startsWith(`${item}.`) || path.startsWith(`${item}[`));
    const warningRule = warningPaths.find((item) => path === item || path.startsWith(`${item}.`) || path.startsWith(`${item}[`));
    changes.push({
      path,
      change: !(path in before) ? "ADDED" : !(path in after) ? "REMOVED" : "MODIFIED",
      severity: protectedRule ? "BLOCK" : warningRule ? "WARNING" : "INFO",
      rule: protectedRule ?? warningRule ?? null
    });
  }
  return {
    baselineConfigId: approved.config_id ?? null,
    candidateConfigId: candidate.config_id ?? null,
    hasBlockingDrift: changes.some((item) => item.severity === "BLOCK"),
    hasWarnings: changes.some((item) => item.severity === "WARNING"),
    changeCount: changes.length,
    changes
  };
}
