# Workflow: Generate Concepts

## Inputs
A validated DiscoveryResult and DesignAnalysis, plus applicable project and feature context.

## Procedure
1. Decide whether materially different alternatives are warranted. Use the [Design Decisions Playbook](../intelligence/DESIGN-DECISIONS-PLAYBOOK.md); if one direction is justified, say why.
2. Frame the must-pass gates, comparison criteria, constraints, evidence and unknowns before generating.
3. Generate 2–3 materially different directions unless the owner explicitly requests one.
4. Make alternatives different in information architecture, task flow, interaction model, permissions, defaults, recovery, or hierarchy—not merely colors.
5. For each direction, create an immutable proposal using the existing `design-proposal.schema.json` contract:
   - `proposal_id`, `session_id`, integer `version`, `name`, and concise `direction`.
   - `rationale.summary`, `rationale.target_users`, and `rationale.ux_strategy`.
   - `visual_system`, `layout`, `component_guidelines`, and `interaction_guidelines`.
   - `tradeoffs`, each with both `benefit` and `cost`.
   - `prototype.status` initially `NOT_GENERATED` and `approval_status` initially `PENDING`.
6. Compare all directions against the same requirements, constraints, user tasks, success measures and must-pass gates. Keep unknown evidence visibly unknown.
7. Record the recommendation, rejected alternatives, rationale and who bears each trade-off in the surrounding decision note.
8. State assumptions and risks explicitly in the proposal narrative and comparison.
9. Validate each proposal against `schemas/design-proposal.schema.json`.

## Guardrails
Do not claim user testing, analytics, or research that did not occur. Do not use a weighted score to hide a failed gate or an unknown that could reverse the decision. The agent recommends; the owner chooses. A generated proposal is not approved.
