# Agent adapters

UADI is agent-agnostic. The installer places the same portable skill and its two core references in the native project skill directory for each supported host.

## Install

From the UADI repository root, run the command for your host:

```bash
node scripts/install-skill.mjs --agent codex
node scripts/install-skill.mjs --agent claude
node scripts/install-skill.mjs --agent cursor
```

To install for all three:

```bash
node scripts/install-skill.mjs --agent all
```

By default, existing files are preserved. Use `--force` only when you intend to replace the installed UADI skill files.

## Install destinations

| Host | Project skill directory |
|---|---|
| OpenAI Codex | `.agents/skills/uadi/` |
| Claude Code | `.claude/skills/uadi/` |
| Cursor | `.cursor/skills/uadi/` |

The installer copies `SKILL.md`, `docs/DESIGN-INTELLIGENCE.md` and `docs/QUALITY-GATES.md`. These are the complete files referenced by the core skill. It does not change host settings or install dependencies.

## Use

Start or refresh the agent, then ask it to use the UADI skill for a design task. Example:

```text
Use UADI to review the onboarding flow in this project.
Identify the main user friction, recommend the highest-impact changes,
implement them using the existing design system, and inspect the result.
```

If your host does not discover the skill automatically, ask it explicitly to read the installed `SKILL.md`.

## Updating

Pull the latest UADI changes, then rerun the installer. Existing files are intentionally not overwritten unless `--force` is supplied.

## Requirements

Node.js 20 or newer. No npm install, package dependency, backend, API key or MCP server is required for installation.
