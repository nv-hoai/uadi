export type Plan = "STARTER" | "GROWTH" | "SCALE";

type PlanDefinition = {
  agentLimit: number | null;
  features: readonly string[];
};

export const plans: Record<Plan, PlanDefinition> = {
  STARTER: { agentLimit: 5, features: [] },
  GROWTH: { agentLimit: 25, features: [] },
  SCALE: { agentLimit: null, features: ["sso"] },
};

export function hasFeature(plan: Plan, feature: string): boolean {
  return plans[plan].features.includes(feature);
}

// Entitlements describe what a plan includes. They do not describe what
// happens to an active SSO connection when the workspace changes plan.
