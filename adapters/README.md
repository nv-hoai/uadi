# Install UADI into an AI agent

UADI is agent-agnostic. The installer copies the selected installation profile into the native project skill directory for the host. `standard` is the default; `compact` is runtime-only and `extended` adds the design-memory example.

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

Choose a profile with `--profile compact|standard|extended` when installing. The profile changes what is shipped, not what the kernel loads at task time.

## Destinations

| Host | Project skill directory |
|---|---|
| OpenAI Codex | `.agents/skills/uadi/` |
| Claude Code | `.claude/skills/uadi/` |
| Cursor | `.cursor/skills/uadi/` |

The `standard` profile copies `SKILL.md`, runtime modules, risk cards, pattern library, reference playbooks, schemas and worked examples. It does not change host settings, install dependencies or contact a server.

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
