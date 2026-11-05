# Add UADI to an AI agent

UADI is a set of instructions, design knowledge, workflows and optional artifacts. It runs inside the AI agent and coding environment you already use.

## Basic integration

1. Make the UADI repository available in the project workspace, or copy the skill and relevant reference files into the agent's supported skills/instructions location.
2. Ask the agent to read `SKILL.md`.
3. Give it a design task in normal language.
4. Let the agent use its existing filesystem, terminal, editor and preview tools.

Example request:

```text
Use UADI to redesign the settings experience.
Inspect the existing product first, identify the biggest UX problems,
propose a better structure, implement it, and review the result.
```

## Host compatibility

UADI is intentionally agent-agnostic. Cursor, Claude Code, Codex and other coding agents can use the same core instructions. The exact installation path depends on each host's skill or project-rules conventions; keep host-specific adapters small and outside the design knowledge itself.

## What the host provides

The host agent already provides the model, conversation, file access and coding tools. A local preview or browser tool is useful for implementation review but is not required to read UADI or perform design reasoning.

## No infrastructure setup

A normal UADI workflow does not require:
- A UADI account or hosted service.
- A backend or database.
- An identity provider or signing key.
- An MCP server.
- A separate orchestration runtime.

Use the project's existing Git workflow for history and collaboration.

## Optional validation tools

The repository includes scripts, schemas and a React renderer. Use them when the project needs structured artifacts or executable prototype validation. They are development aids, not prerequisites for design assistance.

## Safe execution

Follow the host environment's normal security controls. Do not expose production secrets to generated code or run untrusted generated code in privileged environments. UADI does not provide a hardened multi-tenant sandbox.
