# Workflow: Generate Concepts

## Inputs
A validated DiscoveryResult and DesignAnalysis, plus applicable project and feature context.

## Procedure
1. Generate 2–3 materially different directions unless the owner explicitly requests one.
2. Make alternatives different in information architecture, task flow, interaction model, or hierarchy—not merely colors.
3. For each direction, create an immutable proposal using the existing `design-proposal.schema.json` contract:
   - `proposal_id`, `session_id`, integer `version`, `name`, and concise `direction`.
   - `rationale.summary`, `rationale.target_users`, and `rationale.ux_strategy`.
   - `visual_system`, `layout`, `component_guidelines`, and `interaction_guidelines`.
   - `tradeoffs`, each with both `benefit` and `cost`.
   - `prototype.status` initially `NOT_GENERATED` and `approval_status` initially `PENDING`.
4. Compare all directions against the same requirements, constraints, user tasks, and success measures.
5. State assumptions and risks explicitly in the proposal narrative and comparison.
6. Validate each proposal against `schemas/design-proposal.schema.json`.

## Guardrails
Do not claim user testing, analytics, or research that did not occur. The agent recommends; the owner chooses. A generated proposal is not approved.
