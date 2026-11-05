---
name: uadi
description: Embedded, agent-agnostic UX/UI design capability for product discovery, design alternatives, specifications, prototypes, owner feedback, approval, and reusable design rules.
---

# UADI — Universal AI Design Intelligence

Use UADI when a user asks to discover, design, prototype, review, or establish UX/UI rules for a product or feature.

## Start here
1. Read docs/AGENT-INSTRUCTIONS.md.
2. Read docs/ARCHITECTURE.md for boundaries and trust rules.
3. Inspect the project's .uadi/ directory, if present.
4. Load only the workflow and schemas needed for the current task.

## Workflow routing
- New project or missing requirements: follow discovery.
- Requirements understood: analyze and generate design directions.
- A direction selected for exploration: compile UDS and prototype.
- Owner requests changes: record feedback and create a revision.
- Owner explicitly approves a specific version: create approval record and publish configuration.

See docs/WORKFLOW-STATE-MACHINE.md and docs/DOMAIN-MODELS.md.

## Core rules
- Artifacts, not chat history, are the portable source of truth.
- Never invent owner approval.
- Never overwrite approved artifacts in place.
- Validate schemas before treating artifacts as complete.
- Preserve project-level rules and protected constraints when working on features.

This is an initial skill entry point. Detailed workflows and executable tooling will be added incrementally.
