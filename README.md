# UADI — Universal AI Design Intelligence
**An embedded, agent-agnostic UX/UI design capability for AI agents.**
UADI gives an existing AI agent a repeatable, artifact-driven process for discovering product requirements, exploring design directions, specifying design intent, generating prototypes, collecting owner feedback, and publishing approved design rules.
## What UADI is
UADI is an **embedded capability**, not a hosted design platform or standalone AI agent. Its portable core is made of instructions, workflows, schemas, templates, design knowledge, a component catalog, and optional local scripts. The host agent supplies reasoning and tool execution.
## Core principles
- **Agent-agnostic:** no dependency on one model, IDE, or agent framework.
- **Artifact-driven:** project context, proposals, UDS, feedback, revisions, and approvals live in versioned files.
- **Human-in-the-loop:** the authorized product owner makes final design decisions.
- **Portable:** another compatible agent can continue from repository artifacts without chat history.
- **Framework-neutral intent:** UDS is the contract; React is the first renderer target.
- **Governed:** immutable revisions, exact-version approval, configuration inheritance, and non-overridable constraints.
## Design lifecycle
Initialize → Discover → Analyze → Generate concepts → Specify → Prototype → Owner review → Iterate → Approve → Publish configuration.
An agent must never approve its own proposal or silently modify an approved configuration.
## Repository map
- docs/: vision, architecture, integration and validation guides
- workflows/: discovery through approval, revision, governance and rollback
- schemas/: JSON Schema Draft 2020-12 contracts
- runtime/: revision, configuration, approval and governance utilities
- renderers/react/: first React + TypeScript UDS renderer
- adapters/: generic, Cursor, Claude Code and Codex integration guidance
- component-catalog/: stable renderer-independent component IDs
- scripts/ and tests/: validators and automated tests
- examples/minimal/: validated starter artifacts
## Quick start
```bash
npm install
npm test
npm run validate -- examples/minimal/project-context.json examples/minimal/discovery-result.json examples/minimal/design-specification.json
npm run prototype:check -- examples/minimal/design-specification.json
cd renderers/react && npm install && npm run typecheck
```
Read [SKILL.md](SKILL.md), [the architecture](docs/ARCHITECTURE.md), [the integration guide](docs/INTEGRATION-GUIDE.md), [validation guidance](docs/VALIDATION.md), and [the roadmap](ROADMAP.md).
## Current status
The portable embedded MVP includes the core workflows and schemas, a revision runtime, configuration resolver, exact-version approval checks, rollback planning, a starter interactive React renderer, and CI validation. Production browser preview, visual regression, automated browser accessibility testing, host identity integration, and live compatibility tests still require host-specific environments and credentials. Repository CI does not claim those external checks.
## License
No license has been selected. Public visibility does not grant permission to reuse or redistribute this project. See [LICENSE-DECISION.md](LICENSE-DECISION.md).
