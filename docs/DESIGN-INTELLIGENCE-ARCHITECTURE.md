# Five-layer design intelligence architecture

UADI is a design capability for AI coding agents. Its architecture exists to improve design decisions and delivered interfaces—not to maximize documentation, ceremony or artifact count.

The five layers form one learning system:

**Core → Methods → Patterns → Examples → Benchmarks → Core**

Each layer has a distinct responsibility. Use only the depth needed for the task. A small UI change may need one relevant principle and a focused review; a consequential product flow may need the complete evidence-to-validation path.

## 1. The five layers

| Layer | Responsibility | Primary contents | Output |
|---|---|---|---|
| **Core** | Establish the small set of durable principles and decision rules that guide design judgment. | [Design Intelligence](DESIGN-INTELLIGENCE.md), distilled into the agent-facing [SKILL.md](../SKILL.md). | A clear decision priority and shared quality bar. |
| **Methods** | Explain how to reason: understand evidence, analyze tasks, critique, prioritize, explore and validate. | [Product Understanding](../intelligence/PRODUCT-UNDERSTANDING-PLAYBOOK.md), [UX Reasoning](../intelligence/UX-REASONING-PLAYBOOK.md), [Design Decisions](../intelligence/DESIGN-DECISIONS-PLAYBOOK.md), [Visual Design](../intelligence/VISUAL-DESIGN-PLAYBOOK.md), and the relevant [workflows](../workflows/). | A grounded problem analysis, mapped flow, ranked risks, content decisions and justified design decisions. |
| **Patterns** | Offer reusable solutions for recurring problems, including when they fit and when they do not. | [Pattern library](../intelligence/patterns/README.md). | A context-adapted solution with explicit trade-offs—not a copied template. |
| **Examples** | Demonstrate the complete path from evidence through critique and decisions to an inspectable implementation and validation. | [Examples](../examples/), including the [worked onboarding example](../examples/product-onboarding/README.md), the [worked operations dashboard example](../examples/operations-dashboard/README.md) and the [worked SSO discovery example](../examples/sso-discovery/README.md). | A worked reference that makes reasoning and implementation inspectable. |
| **Benchmarks** | Test whether using UADI improves design outcomes compared with a baseline, while tracking cost and uncertainty. | [Benchmark protocol](BENCHMARKING.md), [task briefs](../benchmarks/), scoring and result artifacts. | Reproducible comparative evidence, limitations and improvement priorities. |

### Boundaries and non-goals

- **Core is not a second playbook.** It states durable principles and priorities; methods explain how to apply them.
- **Methods are not mandatory paperwork.** Select the smallest useful method for the task and risk.
- **Patterns are not universal rules.** Context, constraints and evidence determine whether a pattern applies.
- **Examples are not proof by themselves.** A prototype demonstrates an implementation; it does not establish usability, adoption or business impact without appropriate evaluation.
- **Benchmarks do not reward process theater.** More files, longer explanations, UADI vocabulary or checklist completion are not outcomes. Evaluate the delivered work against the same task and evidence standard.

## 2. Source-of-truth map

Avoid maintaining multiple competing versions of the same guidance.

| Concern | Authoritative home | Supporting material |
|---|---|---|
| Durable design principles and decision priorities | [DESIGN-INTELLIGENCE.md](DESIGN-INTELLIGENCE.md) | [SKILL.md](../SKILL.md) routes the agent to relevant guidance and carries concise operating instructions. |
| Product, UX, decision and visual reasoning methods | The four [intelligence playbooks](../intelligence/README.md) | [Workflows](../workflows/) provide task sequences and artifact contracts where useful. |
| Reusable UX solutions | Individual files indexed by the [pattern library](../intelligence/patterns/README.md) | Examples may show one contextual implementation of a pattern. |
| Worked design decisions and implementations | Each example's own README and implementation | The matching benchmark task supplies a comparable scenario where available. |
| Accessibility and interaction review | [ACCESSIBILITY-AND-INTERACTION-REVIEW.md](ACCESSIBILITY-AND-INTERACTION-REVIEW.md) | [Quality gates](QUALITY-GATES.md), the state and form patterns, and the renderer browser tests. |
| Evaluation protocol and claims about effectiveness | [BENCHMARKING.md](BENCHMARKING.md) and [benchmarks/README.md](../benchmarks/README.md) | Raw results, reviewer evidence and analysis support conclusions. |

When guidance overlaps, keep the durable principle in Core and link to the method that operationalizes it. Keep task-specific procedures in workflows. Do not copy long sections between documents merely to make every file self-contained.

## 3. Applying the evidence principle

The [canonical Core](DESIGN-INTELLIGENCE.md) requires decisions to stay grounded and uncertainty to remain visible. Methods operationalize that rule; this architecture does not define a second evidence taxonomy.

For substantial work, label material inputs only as precisely as needed:
- **Supplied:** stated in the task or authoritative brief.
- **Observed:** directly inspected in the product, source, data or behavior.
- **External:** research, analytics, support evidence or a credible external source; record its scope and limits.
- **Inferred:** a reasoned interpretation, not a directly observed fact.
- **Assumed / unknown:** a temporary premise or unanswered question; identify whether it could change the design.
- **Validated:** a check actually performed; state method, environment, result and limits.

Use a compact trace for consequential decisions:

**Evidence → user/task implication → problem → decision and trade-off → implementation → validation.**

The [Product Understanding Playbook](../intelligence/PRODUCT-UNDERSTANDING-PLAYBOOK.md) explains how to inspect and qualify product evidence. The [UX Reasoning Playbook](../intelligence/UX-REASONING-PLAYBOOK.md) explains how to turn it into prioritized design decisions. A formal ledger is useful for complex work, not required for every small change.

## 4. How the layers connect

| Transition | Required connection | A useful review question |
|---|---|---|
| Core → Methods | The method applies one or more core principles to the current problem. | Which principle changes what we inspect or decide? |
| Methods → Patterns | A pattern is selected because it addresses a diagnosed need and fits the constraints. | Why this pattern here, and what would make it a poor fit? |
| Patterns → Examples | The implementation shows how the pattern was adapted, including important states and trade-offs. | Can a reviewer see the decision in the actual interface? |
| Examples → Benchmarks | The example or deliverable can be assessed against a task brief and consistent rubric. | Are baseline and UADI artifacts comparable and sufficiently complete? |
| Benchmarks → Core | Findings identify which guidance to retain, clarify, narrow or remove. | What evidence justifies changing the guidance? |

A worked example should normally identify its task or problem, evidence and unknowns, critique, selected approach and alternatives, pattern references where relevant, implementation, validation performed and remaining limitations. Keep the narrative proportional to the complexity of the example.

## 5. Benchmark and learning loop

The benchmark protocol is the authority for sample qualification, blinding, scoring and study interpretation. This architecture does not replace or relax those requirements.

Use this sequence:

1. **Freeze the comparison.** Record task version, project snapshot, agent/model versions, conditions and evaluation rubric before collecting results.
2. **Create comparable candidates.** Baseline and UADI conditions receive equivalent task context, time/resource constraints and implementation opportunities.
3. **Collect inspectable evidence.** Preserve source, runnable previews or equivalent screenshots, test output and relevant execution metadata.
4. **Review independently and blindly.** Apply the same rubric to both candidates. Mark a dimension unscoreable when its required evidence is missing; do not infer a score.
5. **Report quality and cost.** Include dimension-level results, reviewer disagreement, task/model variation, completion time and study limitations. Separate descriptive differences from causal claims.
6. **Decide what to change.** Use repeated, credible weaknesses to update the narrowest relevant layer: a principle, method, pattern, example or benchmark instrument.
7. **Re-test the change.** Preserve prior results and protocol versions so improvements and regressions remain interpretable.

A benchmark result is not a general claim about all products, agents or users. Small pilots are exploratory. Confirmatory claims require the protocol's required coverage and independent review. Synthetic fixtures, planned tests and unexecuted CI workflows are not empirical benchmark results.

### What counts as improvement

Judge the delivered design first:

- Product and task understanding.
- UX reasoning and decision quality.
- Visual hierarchy and design judgment.
- Interaction completeness.
- Accessibility and responsive behavior.
- Implementation quality and correctness.

Also track the cost of obtaining that result, such as elapsed time and unnecessary process. A higher quality score with materially higher cost may still be useful, but the trade-off must be visible. Do not collapse quality and cost into a single headline without showing both.

## 6. Lightweight application rules

Choose depth by consequence, uncertainty and scope:

- **Small, low-risk change:** inspect local context, apply relevant Core guidance and one matching pattern if useful, then perform a focused review.
- **Meaningful feature or flow:** use the relevant Methods, record material assumptions, rank UX risks, adapt patterns and validate important states.
- **New or high-risk experience:** use the full evidence-to-implementation trace, compare meaningful alternatives, inspect the rendered result and document limitations.
- **Capability or guidance change:** identify the affected layer, link it to evidence or a concrete failure mode, and use benchmarks when making an effectiveness claim.

Do not create an artifact simply because a workflow names one. Use structured artifacts when intent needs to persist, be compared, validated or reused.

## 7. Current maturity and next priorities

This is a repository-level planning assessment, not a measured score:

- **Core:** principles exist; keep one authoritative source and prevent duplication.
- **Methods:** substantial playbooks and workflows exist; UX reasoning covers flow branches, handoffs, edge-case derivation and content design, design decisions covers alternatives, rationale and trade-offs, and accessibility/interaction review guidance is available. Improve traceability and validation without adding process.
- **Patterns:** a useful starting library exists; improve consistency and evidence links before expanding it.
- **Examples:** onboarding, operations-dashboard and SSO discovery worked examples cover a guided flow, an investigation/comparison flow and a brownfield discovery/context-synthesis path; validate them in real reviews before expanding further.
- **Benchmarks:** protocol and tooling exist; completed, verified pilot evidence is still needed before claiming UADI improves outcomes.

Prioritize connecting existing material and obtaining credible evaluation evidence over increasing document or pattern count.

## Related references

- [Agent entry point](../SKILL.md)
- [Design Intelligence principles](DESIGN-INTELLIGENCE.md)
- [Intelligence library](../intelligence/README.md)
- [Workflows](../workflows/)
- [Worked onboarding example](../examples/product-onboarding/README.md)
- [Worked operations dashboard example](../examples/operations-dashboard/README.md)
- [Worked SSO discovery example](../examples/sso-discovery/README.md)
- [Benchmark protocol](BENCHMARKING.md)
- [Benchmark operations and scoring](../benchmarks/README.md)
