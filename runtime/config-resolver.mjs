const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const merge = (base, override) => {
  const result = structuredClone(base ?? {});
  for (const [key, value] of Object.entries(override ?? {})) result[key] = isObject(value) && isObject(result[key]) ? merge(result[key], value) : structuredClone(value);
  return result;
};
export function resolveDesignConfiguration({ defaults = {}, project = {}, feature = null }) {
  const tokens = merge(merge(defaults.tokens ?? {}, project?.tokens ?? {}), feature?.tokens ?? {});
  const rules = new Map();
  for (const rule of [...(defaults.rules ?? []), ...(project?.rules ?? []), ...(feature?.rules ?? [])]) {
    if (rule.level === "NON_OVERRIDABLE") rules.set(rule.rule_id, structuredClone(rule));
    else rules.set(rule.rule_id, structuredClone(rule));
  }
  for (const rule of defaults.rules ?? []) if (rule.level === "NON_OVERRIDABLE") rules.set(rule.rule_id, structuredClone(rule));
  return { tokens, rules: [...rules.values()], precedence: ["FEATURE_OVERRIDE", "PROJECT_CONFIGURATION", "UADI_DEFAULTS"], non_overridable_enforced: true };
}
export function validateConfigurationOverrides({ defaults = {}, project = {}, feature = null }) {
  const violations = [];
  const locked = new Map((defaults.rules ?? []).filter((rule) => rule.level === "NON_OVERRIDABLE").map((rule) => [rule.rule_id, rule]));
  for (const [scope, config] of [["PROJECT", project], ["FEATURE", feature]]) for (const rule of config?.rules ?? []) {
    const baseline = locked.get(rule.rule_id);
    if (baseline && JSON.stringify(rule) !== JSON.stringify(baseline)) violations.push({ scope, rule_id: rule.rule_id, reason: "NON_OVERRIDABLE rule cannot be changed" });
  }
  return { valid: violations.length === 0, violations };
}
