# UADI — Universal AI Design Intelligence

**An embedded, agent-agnostic UX/UI design capability for AI agents.**

UADI gives an AI agent a repeatable, artifact-driven process for discovering product requirements, exploring design directions, generating prototypes, collecting owner feedback, and publishing approved design rules.

## What UADI is

UADI is an **embedded capability**, not a hosted design platform or a standalone AI agent. It is designed to be installed into different agent environments through portable instructions, schemas, templates, and optional scripts.

## Core principles

- **Agent-agnostic:** do not depend on one model, IDE, or agent framework.
- **Artifact-driven:** persist project context, proposals, specifications, feedback, and approvals as structured files.
- **Human-in-the-loop:** the product owner makes final design decisions.
- **Portable:** another compatible agent can continue from repository artifacts without relying on chat history.
- **Framework-neutral design intent:** use UADI Design Specification (UDS) as an intermediate representation; React is the first prototype renderer, not the design contract.
- **Governed:** approved rules, version history, and non-overridable constraints are explicit.

## Design lifecycle

`Initialize → Discover → Analyze → Generate concepts → Specify → Prototype → Owner review → Iterate → Approve → Publish configuration`

An agent must never approve its own proposal or silently modify an approved configuration.

## Repository status

This repository is the initial documentation and contract foundation. The MVP will be delivered incrementally:

1. Foundation: instructions, project context, discovery, schemas.
2. Design intelligence: analysis, multiple proposals, comparison, UDS.
3. Prototype and iteration: component catalog, React renderer, feedback, revisions.
4. Approval and design system: approval records, configuration, inheritance, validation.
5. Integrations: agent-specific adapters and optional MCP support.

## Planned structure

```text
uadi/
├── SKILL.md
├── instructions/
├── workflows/
├── schemas/
├── templates/
├── design-knowledge/
├── component-catalog/
├── scripts/
├── adapters/
├── examples/
└── docs/
```

## Status

**Early design / MVP foundation.** Schemas and interfaces may evolve before the first stable release. See [ROADMAP.md](ROADMAP.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## License

To be selected before the first public release. Until a license is added, no permissions beyond applicable default copyright law are granted.
