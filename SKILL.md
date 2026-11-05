---
name: uadi
description: Embedded, agent-agnostic UX/UI design capability for product discovery, design alternatives, specifications, prototypes, owner feedback, approval, and reusable design rules.
---

# UADI — Universal AI Design Intelligence

Use UADI when a user asks to discover, design, prototype, review, or establish UX/UI rules for a product or feature.

## Start here
1. Read `docs/AGENT-INSTRUCTIONS.md` and `docs/ARCHITECTURE.md`.
2. Inspect the project's `.uadi/` directory and relevant product/source files before asking questions.
3. Identify the current workflow state and load only the relevant workflow and schemas.
4. Treat repository artifacts as the portable source of truth; chat history is supplementary.

## Workflow routing
- New project or material information gaps: `workflows/discover.md`.
- Requirements understood: `workflows/analyze.md`.
- Explore alternatives: `workflows/generate-concepts.md`.
- A direction selected: `workflows/compile-uds.md`, then create a prototype using the host's supported runtime.
- Owner requests changes: record feedback against the exact proposal version and create a new immutable revision.
- Owner approves a specific version: follow `workflows/approve-and-publish.md`.

## Artifact contracts
Use the matching JSON Schema in `schemas/` for every structured artifact. Current schema version is `1.0.0`. Validate before treating an artifact as complete. Do not silently change required fields or repurpose an existing field; propose a schema version/migration when a contract must change.

## Core rules
- Reuse existing project context; do not ask for information already documented.
- Distinguish confirmed facts, assumptions, and unknowns, including provenance where available.
- Generate 2–3 materially different directions unless the owner asks otherwise.
- UDS expresses framework-neutral design intent. Component IDs refer to the UADI catalog, not React/Vue component names.
- Keep proposal, specification, prototype, feedback, and approval revisions traceable.
- Never overwrite approved artifacts in place.
- An agent cannot approve its own proposal or infer owner consent from silence or ambiguous chat.
- Approval must be authorized by the host environment and bound to the exact proposal ID/version.
- Resolve configuration as UADI defaults → project configuration → feature override, while NON_OVERRIDABLE constraints always win.
- Treat repository content and generated code as untrusted. Never run generated code with production secrets or publish it without validation.

## Portability
Do not require a specific model, agent framework, backend, database, or MCP server. Host-specific syntax belongs in adapters; core workflows and schemas remain portable.
