# Workflow: Analyze

## Inputs
ProjectContext, FeatureContext (if applicable), validated DiscoveryResult.

## Procedure
1. Translate the product problem into user tasks and desired outcomes.
2. Identify primary user groups from evidence; avoid fictional demographic detail.
3. Convert needs into traceable requirements with MUST/SHOULD/COULD priority.
4. Map the primary task flow from entry through decision, action, confirmation, handoff and recovery. Add only the branches that change the interface or copy.
5. Derive high-impact edge cases from roles, object states, data, timing, dependencies and environment. Decide whether to design, explain, block for a decision or record as out of scope.
6. Draft the labels, consequences and state messages that carry the flow before fixing the layout.
7. Map friction, empty/loading/error states, and accessibility risks.
8. Identify opportunities and measurable success signals.
9. Record assumptions and unresolved risks.
10. Save and validate DesignAnalysis.

Use the [UX Reasoning Playbook](../intelligence/UX-REASONING-PLAYBOOK.md) for flow mapping, edge-case derivation and content design. Keep the analysis proportional to the task; do not create every section for a small change.

## Output
A DesignAnalysis artifact. Analysis explains what the design must solve; it does not select a visual concept or approve a solution.
