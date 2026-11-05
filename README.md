# UADI — Universal AI Design Intelligence

**Give your AI agent better product, UX and visual design judgment.**

UADI is a lightweight design capability you add to an existing AI coding agent. It helps the agent understand a product, reason about user experience, explore design directions, specify design intent and build better interfaces.

UADI is a repository of design intelligence—not another agent, SaaS, backend or design platform.

## Why UADI

Without a design process, an agent often jumps from a short prompt straight into UI code. UADI teaches it to:

- Understand the product, its users and the real problem.
- Identify UX risks and missing requirements before coding.
- Explore meaningfully different design directions.
- Explain design decisions and trade-offs.
- Define framework-neutral design intent before implementation.
- Build, review and improve a working prototype.
- Reuse consistent patterns instead of inventing every screen from scratch.

**The goal is not more process. The goal is better design output.**

## Use UADI with your agent

1. Add this repository to your project or make its instructions available to your coding agent.
2. Ask the agent to read [SKILL.md](SKILL.md).
3. Describe what you want to design.

Example:

```text
Use UADI to design the onboarding experience for this product.
First understand the product and users, then identify UX risks,
propose 2–3 distinct directions, and build the strongest option.
```

You can also ask for focused work:

```text
Use UADI to review this dashboard and identify the five highest-impact UX improvements.
```

No UADI account, server, database, API key, MCP server or identity provider is required. The host agent uses its existing file, coding and preview capabilities.

## The design workflow

**Understand → Analyze → Explore → Specify → Build → Review → Improve**

UADI adapts the depth of this workflow to the task. A small UI change should stay lightweight; a new product experience deserves deeper discovery and alternatives.

## What is inside

- `SKILL.md` — the entry point for an AI agent.
- `intelligence/` — practical UX reasoning playbook and contextual pattern library.
- `docs/` — product vision, architecture, workflows and quality guidance.
- `workflows/` — practical design workflows.
- `schemas/` and `templates/` — portable design artifacts and UDS contracts.
- `component-catalog/` and `renderers/` — reusable component concepts and the first React renderer.
- `examples/` — examples to learn from and adapt.
- `scripts/` — optional local validation and installation tools.

## Install into an AI agent

From this repository root:

```bash
node scripts/install-skill.mjs --agent codex
# or: --agent claude | cursor | all
```

The installer uses Node.js built-ins only and copies the skill plus its core references into the host's project skill directory. It preserves existing files unless `--force` is supplied. See [all adapter instructions](adapters/README.md).

## Optional local validation

The design capability itself does not require installation. If you want to validate repository artifacts:

```bash
npm install
npm test
npm run validate -- examples/minimal/project-context.json examples/minimal/discovery-result.json examples/minimal/design-specification.json
```

The React renderer and browser tests are optional development tooling. See [the renderer guide](renderers/react/README.md).

## Design quality principles

UADI prioritizes product understanding, UX reasoning, design judgment, visual intelligence and execution quality. Its quality checklist is guidance for better work—not a mandatory release pipeline.

Human owners remain in control of product decisions. Use the host project's normal review process and Git history; UADI does not impose a separate approval or release system.

## Learn more

- [Agent instructions](docs/AGENT-INSTRUCTIONS.md)
- [Design Intelligence](docs/DESIGN-INTELLIGENCE.md)
- [Integration guide](docs/INTEGRATION-GUIDE.md)
- [UDS and architecture](docs/ARCHITECTURE.md)
- [Design quality checklist](docs/QUALITY-GATES.md)
- [Benchmarking Design Intelligence](docs/BENCHMARKING.md)
- [Roadmap](ROADMAP.md)

## License

No license has been selected yet. Public visibility does not grant permission to reuse or redistribute this project. See [LICENSE-DECISION.md](LICENSE-DECISION.md).
