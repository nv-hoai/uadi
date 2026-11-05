# UADI — Universal AI Design Intelligence

**An embedded, agent-agnostic UX/UI design capability for AI agents.**

UADI gives an existing AI agent a repeatable, artifact-driven process for discovering product requirements, exploring design directions, specifying design intent, generating prototypes, collecting owner feedback, and publishing approved design rules.

## What UADI is

UADI is an **embedded capability**, not a hosted design platform or standalone AI agent. Its portable core is made of instructions, workflows, schemas, templates, design knowledge, a component catalog, and optional local scripts. The host agent supplies reasoning and tool execution.

## Core principles

- **Agent-agnostic:** no dependency on one model, IDE, or agent framework.
- **Artifact-driven:** project context, proposals, UDS, feedback, and approvals live in versioned files.
- **Human-in-the-loop:** the authorized product owner makes final design decisions.
- **Portable:** another compatible agent can continue from repository artifacts without chat history.
- **Framework-neutral intent:** UADI Design Specification (UDS) is the contract; React is the first renderer target.
- **Governed:** immutable revisions, explicit approval, inheritance, and non-overridable constraints.

## Design lifecycle

`Initialize → Discover → Analyze → Generate concepts → Specify → Prototype → Owner review → Iterate → Approve → Publish configuration`

An agent must never approve its own proposal or silently modify an approved configuration.

## Repository map

```text
.
├── SKILL.md
├── docs/                 # Vision, architecture, workflow, models, validation
├── workflows/            # Discovery through approval and publishing
├── schemas/              # JSON Schema Draft 2020-12 contracts
├── templates/            # Project and feature context starters
├── component-catalog/    # Stable renderer-independent component IDs
├── scripts/              # Local validation utilities
├── tests/                # Contract fixture tests
├── examples/minimal/     # Validatable example artifacts
└── .github/workflows/    # CI validation
```

## Quick start

```bash
npm install
npm test
npm run validate -- examples/minimal/project-context.json examples/minimal/discovery-result.json
```

Read [SKILL.md](SKILL.md) for the agent entry point, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for architecture boundaries, [docs/VALIDATION.md](docs/VALIDATION.md) for local checks, and [ROADMAP.md](ROADMAP.md) for implementation status.

## Current status

Early MVP foundation and design-intelligence contracts are in place. The React renderer has a type-checked static foundation for the starter catalog; stateful interactions, production styling, configuration resolution, broader compatibility tests, and host-specific adapters remain planned work. Schema validity is not a substitute for usability, accessibility, authorization, or runtime testing.

## License

No license has been selected. Public visibility does not grant permission to reuse or redistribute this project. See [LICENSE-DECISION.md](LICENSE-DECISION.md).
