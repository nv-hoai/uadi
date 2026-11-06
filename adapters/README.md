# Install UADI into an AI agent

UADI is agent-agnostic. The installer copies the same portable skill, reasoning playbooks, contextual UX pattern library and referenced worked examples into the native project skill directory for the selected host.

Run one command from the UADI repository root:

```bash
node scripts/install-skill.mjs --agent codex
node scripts/install-skill.mjs --agent claude
node scripts/install-skill.mjs --agent cursor
```

To install for all supported hosts:

```bash
node scripts/install-skill.mjs --agent all
```

## Destinations

| Host | Project skill directory |
|---|---|
| OpenAI Codex | `.agents/skills/uadi/` |
| Claude Code | `.claude/skills/uadi/` |
| Cursor | `.cursor/skills/uadi/` |

The installer copies `SKILL.md`, the core design guidance, every reasoning playbook, the UX pattern library and the worked examples those patterns reference. It does not change host settings, install dependencies or contact a server.

Existing files are preserved by default. Use `--force` only when you intend to replace the installed UADI skill files. To update UADI, pull the latest repository changes and rerun the installer.

## Use

Start or refresh the agent, then ask it to use UADI for a design task. For example:

```text
Use UADI to understand this product and improve its onboarding.
Inspect the existing product and rules first, identify the main user friction,
recommend a coherent UX and visual direction, implement it using the existing
design system, and inspect the rendered result.
```

Any coding agent that can read project files and follow repository instructions can use UADI manually: make this repository available and ask it to read `SKILL.md`.

## Requirements

Node.js 20 or newer for the installer. No npm install, package dependency, backend, API key or MCP server is required for installation.
