# UADI — Universal AI Design Intelligence

**An embedded, agent-agnostic UX/UI design capability for AI agents.**

UADI gives an existing AI agent a repeatable, artifact-driven process for discovering product requirements, exploring design directions, specifying design intent, generating prototypes, collecting owner feedback, and publishing approved design rules.

## What UADI is
UADI is an **embedded capability**, not a hosted design platform or standalone AI agent. Its portable core is made of instructions, workflows, schemas, templates, design knowledge, a component catalog, and optional local scripts. The host agent supplies reasoning and tool execution.

## Core principles
- **Agent-agnostic:** no dependency on one model, IDE, or agent framework.
- **Artifact-driven:** project context, proposals, UDS, feedback, revisions, approvals and evidence live in versioned files.
- **Human-in-the-loop:** the authorized product owner makes final design decisions.
- **Portable:** another compatible agent can continue from repository artifacts without chat history.
- **Framework-neutral intent:** UDS is the contract; React is the first renderer target.
- **Governed:** immutable revisions, exact-version approval, configuration inheritance, non-overridable constraints and evidence-bound quality gates.

## Design lifecycle
Initialize → Discover → Analyze → Generate concepts → Specify → Prototype → Owner review → Iterate → Approve → Publish configuration → Continuous governance.

An agent must never approve its own proposal or silently modify an approved configuration.

## Repository map
- docs/: vision, architecture, integration, security, quality gates and continuous governance
- workflows/: discovery through approval, revision, gate evaluation and rollback
- schemas/: JSON Schema Draft 2020-12 contracts
- runtime/: revision, configuration, approval, governance, gates, evidence, quality and drift utilities
- renderers/react/: first React + TypeScript UDS renderer and isolated browser harness
- component-catalog/: stable renderer-independent component IDs
- scripts/ and tests/: validators and automated tests
- examples/minimal/: validated starter artifacts

## Quick start
```bash
npm install
npm test
npm run validate -- examples/minimal/project-context.json examples/minimal/discovery-result.json examples/minimal/design-specification.json
npm run prototype:check -- examples/minimal/design-specification.json
cd renderers/react && npm install && npm run typecheck && npm run build
npx playwright install chromium
npm test
```

To evaluate a release report containing ten gate results bound to the same artifact ID, version and SHA-256 digest:
```bash
npm run gates:check -- ./gate-release-report.json
```

Read [SKILL.md](SKILL.md), [the architecture](docs/ARCHITECTURE.md), [the integration guide](docs/INTEGRATION-GUIDE.md), [quality gates](docs/QUALITY-GATES.md), [security boundary](docs/SECURITY-BOUNDARY.md), [continuous governance](docs/CONTINUOUS-GOVERNANCE.md), [browser validation](renderers/react/tests/README.md), and [the roadmap](ROADMAP.md).

## Browser and security boundary
CI uses a fresh GitHub-hosted runner, a loopback-only Vite preview, and Chromium. The browser test guard aborts requests to non-loopback hosts. The preview consumes a fixed React renderer and JSON UDS fixture; it does not execute AI-generated source code or receive production secrets. CI runs axe-core WCAG 2.1 A/AA checks, keyboard interaction checks, mobile overflow checks, and a pixel-diff against a committed SVG desktop baseline. Screenshots and diff images are uploaded as a short-lived workflow artifact.

Static source inspection is heuristic and is not a sandbox. This is an ephemeral test harness, not a public preview hosting service or hardened multi-tenant execution environment. Production execution of untrusted generated code still requires a dedicated disposable container/VM, no secrets, restricted egress, resource limits and a read-only base filesystem. See [the security boundary](docs/SECURITY-BOUNDARY.md).

## Current status
The repository contains portable foundations for the three UADI phases: ten-gate release evaluation, evidence-bound quality checks, immutable evidence records, quality scoring, design drift reporting, revision/governance controls and the React browser smoke suite. Host identity integration, hardened execution infrastructure, broader cross-browser/component coverage, manual WCAG audits, recurring CI scheduling and quality-threshold calibration still require deployment environments, credentials or human validation. Repository code does not attest to those external controls.

## License
No license has been selected. Public visibility does not grant permission to reuse or redistribute this project. See [LICENSE-DECISION.md](LICENSE-DECISION.md).
