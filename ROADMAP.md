# UADI Roadmap — Design Intelligence First

UADI is successful when it measurably improves the design quality of the AI agents that use it. Roadmap priorities are based on user-visible design outcomes, not infrastructure or module count.

## Phase 1 — Useful and effortless

**Goal:** Add UADI to an existing agent and get better design work immediately.

- [x] Embedded, agent-agnostic capability with no required backend.
- [x] Core design workflow and portable UDS contracts.
- [x] React renderer foundation and optional local validation.
- [x] One-command installation paths for popular agent environments.
- [x] Strong end-to-end examples that show the workflow on real product tasks.

**Success signal:** A developer can make UADI available to an agent and use it without provisioning infrastructure or learning a complex framework.

## Phase 2 — Better design decisions

**Goal:** Make the agent noticeably better at understanding products and designing usable interfaces.

- [x] Practical product understanding, UX reasoning and visual design playbooks.
- [x] Contextual patterns for settings, permissions, destructive actions, recovery, tables and forms.
- [x] Improve end-to-end product discovery and context synthesis through representative worked examples.
- [x] Deepen UX reasoning, task flows, edge cases and content design.
- [x] Improve design alternatives, rationale and trade-off analysis.
- [x] Expand reusable visual and interaction patterns with implementation examples.
- [x] Define a multi-task paired benchmark suite, blind-review protocol and local score calculator.
- [x] Run an exploratory paired benchmark pilot with and without UADI across representative tasks. See the [pilot record](benchmarks/studies/design-intelligence-pilot-2026-11/README.md); it is not confirmatory and its condition scores are confounded by a candidate-position effect.
- [x] Re-review the pilot with the standard two-reviewer machine panel: blinded independent sessions, evidence crops, frozen round-1 scores, evidence exchange and a final decision. See the [machine review](benchmarks/studies/design-intelligence-pilot-2026-11/machine-review/README.md).
- [x] Redesign the confirmatory study with balanced candidate order, independent reviewer families, calibration seeds, held-out tasks, state capture and paired uncertainty. See the [preregistered design](benchmarks/CONFIRMATORY-STUDY.md).
- [x] Run the preregistered two-model-family confirmatory study and quantify candidate-order bias ([#48](https://github.com/nv-hoai/uadi/issues/48), [#52](https://github.com/nv-hoai/uadi/issues/52)). Outcome: [confirmatory study record](benchmarks/studies/confirmatory-2026-11/README.md) — UADI +5.8 mean (13/18 pairs), paired 95% interval −3.9 to +15.5: superiority rule not met (inconclusive), position sensitivity remains large (A +13.0, B −1.4).
- [x] Improve accessibility and interaction review guidance.

**Success signal:** Blind or structured reviews show more useful, coherent and usable results than the same agent working without UADI. A confirmatory machine-reviewed study now records +5.8 mean (13/18 pairs won) but the paired 95% interval includes zero, so superiority is not established; position effects remain large and human review is optional (not required).

## Phase 3 — Reusable design intelligence

**Goal:** Help agents carry good design decisions across features and projects without adding mandatory infrastructure.

- [ ] Curate reusable product and UX patterns with context and applicability notes.
- [ ] Improve project-level design memory through simple repository artifacts.
- [ ] Detect inconsistencies with existing project conventions when relevant.
- [x] Build a repeatable evaluation set for design quality and regression: deterministic gates for the inner loop plus the held-out suite for agent-change acceptance. First cycle recorded: [cycle 0](benchmarks/studies/agent-loop/cycle-0/README.md).

**Success signal:** Design quality and consistency improve over repeated tasks while setup remains lightweight.

## Explicit non-goals for the core

- No UADI-hosted agent or SaaS.
- No required backend, database, identity provider or key management.
- No required MCP server or model-specific integration.
- No mandatory signed attestations, release dashboard or continuous governance service.
- No dedicated sandbox infrastructure requirement for ordinary design assistance.
