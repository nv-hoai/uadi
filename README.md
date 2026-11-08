# UADI — Universal AI Design Intelligence

**Give your AI agent better product, UX and visual design judgment.**

UADI is a lightweight design capability you add to an existing AI coding agent. It helps the agent understand a product, reason about user experience, make design decisions, compose a coherent visual system and build better interfaces.

UADI is a repository of design intelligence—not another agent, SaaS, backend or design platform.

## Why UADI

Without design guidance, an agent often jumps from a short prompt straight into UI code. Its output may look plausible while missing product rules, user goals, interaction states, visual hierarchy, accessibility or product fit.

UADI helps the agent:

- Understand the product, its users, domain rules and business context.
- Identify UX risks and missing requirements before coding.
- Map task flows, edge cases and content before choosing a layout.
- Explore meaningful design directions and explain trade-offs.
- Compose hierarchy, typography, spacing and visual language intentionally.
- Build, inspect and improve a working interface.
- Reuse contextual patterns instead of inventing every screen from scratch.

**The goal is not more process. The goal is better design output.**

## Use UADI with your agent

1. Add this repository to your project or make its instructions available to your coding agent.
2. Ask the agent to read [SKILL.md](SKILL.md).
3. Describe what you want to design.

Example:

```text
Use UADI to improve the onboarding experience for this product.
First inspect the product, users and important business rules.
Then identify UX risks, recommend a coherent visual direction,
implement the strongest approach and inspect the rendered result.
```

You can also ask for focused work:

```text
Use UADI to review this dashboard and identify the five highest-impact UX improvements.
```

No UADI account, server, database, API key, MCP server or identity provider is required. The host agent uses its existing file, coding and preview capabilities.

## The design workflow

**Understand → Analyze → Explore → Specify → Build → Review → Improve**

UADI adapts the depth of this workflow to the task. A small UI change should stay lightweight; a new product experience deserves deeper product understanding, UX reasoning and visual design.

## What is inside

- `SKILL.md` — the entry point for an AI agent.
- `intelligence/` — six runtime reasoning modules, trigger-only risk cards, contextual patterns and reference playbooks.
- `docs/` — product vision, architecture, integration and quality guidance.
- `workflows/` — practical design workflows.
- `schemas/` and `templates/` — portable design artifacts, UDS contracts and project-level design memory.
- `component-catalog/` and `renderers/` — reusable component concepts and the first React renderer.
- `examples/` — examples to learn from and adapt.
- `scripts/` — optional local validation and installation tools.

## Install into an AI agent

From this repository root:

```bash
node scripts/install-skill.mjs --agent codex
# or: --agent claude | cursor | all
# profiles: --profile compact | standard (default) | extended
```

The installer uses Node.js built-ins only. `standard` copies the full portable skill (runtime modules, risk cards, pattern library, reference playbooks, schemas and examples); `compact` copies the runtime, patterns, UDS contract and memory contract; `extended` adds the design-memory worked example. It preserves existing files unless `--force` is supplied. See [supported agent installation](adapters/README.md).

## Optional local validation

The design capability itself does not require installation. If you want to validate repository artifacts:

```bash
npm ci
npm test
npm run validate -- examples/minimal/project-context.json examples/minimal/discovery-result.json examples/minimal/design-specification.json
npm run context:report
```

The context report is a static `chars/4` audit, not a measured token count. See [Context efficiency](docs/CONTEXT-EFFICIENCY.md) for the measurement contract.

The React renderer and browser tests are optional development tooling. See [the renderer guide](renderers/react/README.md).

## Design quality principles

UADI prioritizes product understanding, UX reasoning, design judgment, visual intelligence and execution quality. Its quality checklist is guidance for better work—not a mandatory release pipeline.

Human owners remain in control of product decisions. Use the host project's normal review process and Git history; UADI does not impose a separate approval or release system.

## Learn more

- [Agent instructions](docs/AGENT-INSTRUCTIONS.md)
- [Five-layer design intelligence architecture](docs/DESIGN-INTELLIGENCE-ARCHITECTURE.md) — responsibilities, source of truth, evidence traceability and the learning loop
- [Design Intelligence](docs/DESIGN-INTELLIGENCE.md)
- [Runtime reasoning modules](intelligence/README.md)
- [Project design memory](workflows/design-memory.md) — approved decisions, rejected directions and a compact brief
- [Design memory example](examples/design-memory/README.md) — source JSON, generated brief and proposed-vs-approved behavior
- [Product Understanding](intelligence/PRODUCT-UNDERSTANDING-PLAYBOOK.md) (reference)
- [UX Reasoning](intelligence/UX-REASONING-PLAYBOOK.md) (reference)
- [Design Decisions](intelligence/DESIGN-DECISIONS-PLAYBOOK.md) (reference)
- [Visual Design](intelligence/VISUAL-DESIGN-PLAYBOOK.md) (reference)
- [UX Pattern Library](intelligence/patterns/README.md)
- [Worked onboarding example](examples/product-onboarding/README.md) — evidence synthesis, ranked critique and runnable prototype
- [Worked operations dashboard example](examples/operations-dashboard/README.md) — comparison, drill-down, data states and accessibility validation
- [Worked SSO discovery example](examples/sso-discovery/README.md) — brownfield evidence, blocking questions, context synthesis and guarded enforcement
- [Integration guide](docs/INTEGRATION-GUIDE.md)
- [UDS and architecture](docs/ARCHITECTURE.md)
- [Design quality checklist](docs/QUALITY-GATES.md)
- [Accessibility and interaction review](docs/ACCESSIBILITY-AND-INTERACTION-REVIEW.md)
- [Context efficiency baseline](docs/CONTEXT-EFFICIENCY.md) — Minimum Sufficient Context, measurement definitions and the Stage 0 audit
- [Benchmarking Design Intelligence](docs/BENCHMARKING.md)
- [Two-reviewer machine review](docs/MACHINE-REVIEW.md) — the standing benchmark review workflow
- [Confirmatory study design](benchmarks/CONFIRMATORY-STUDY.md) — balanced order, independent judge families, held-out tasks and paired uncertainty
- [Exploratory paired benchmark pilot](benchmarks/studies/design-intelligence-pilot-2026-11/README.md) — real runs, preserved evidence and position-control finding
- [Machine review of the pilot](benchmarks/studies/design-intelligence-pilot-2026-11/machine-review/README.md) — two blinded reviewers, evidence crops, frozen scores and a final decision
- [Review dashboard](benchmarks/studies/design-intelligence-pilot-2026-11/machine-review/dashboard.html) — filterable pair table, dimension and position charts, evidence drawer
- [Roadmap](ROADMAP.md)

## License

UADI is released under the [MIT License](LICENSE). You may use, modify and distribute it under the terms of that license.
