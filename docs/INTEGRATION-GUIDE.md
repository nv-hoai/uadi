# Add UADI to an AI agent

UADI is a set of instructions, design knowledge, workflows and optional artifacts. It runs inside the AI agent and coding environment you already use.

## One-command installation

From the UADI repository root, run one of:

```bash
node scripts/install-skill.mjs --agent codex
node scripts/install-skill.mjs --agent claude
node scripts/install-skill.mjs --agent cursor
```

Or install for all supported hosts:

```bash
node scripts/install-skill.mjs --agent all
```

The installer uses Node.js built-ins only; no `npm install` is needed. Existing files are preserved unless you explicitly pass `--force`.

### Installation profiles

| Profile | Contents |
|---|---|
| `compact` | Kernel, six reasoning modules, risk cards, patterns, UDS contract, quality/accessibility brief and the design-memory contract. Best for constrained hosts. |
| `standard` (default) | Compact plus reference playbooks, UDS schemas, component catalog and worked examples. |
| `extended` | Standard plus the design-memory worked example. |

```bash
node scripts/install-skill.mjs --agent codex --profile compact
node scripts/install-skill.mjs --agent codex --profile extended
```

The profile changes what is installed, not what an agent loads. The kernel still routes to one module at a time.

## Use

Start or refresh the host agent and ask it to use UADI. For example:

```text
Use UADI to redesign the settings experience.
Inspect the existing product first, identify the biggest UX problems,
propose a better structure, implement it, and review the result.
```

## Host skill locations

| Host | Project skill directory |
|---|---|
| OpenAI Codex | `.agents/skills/uadi/` |
| Claude Code | `.claude/skills/uadi/` |
| Cursor | `.cursor/skills/uadi/` |

See [adapter instructions](../adapters/README.md) for details.

## What the host provides

The host agent already provides the model, conversation, file access and coding tools. A local preview or browser tool is useful for implementation review but is not required to read UADI or perform design reasoning.

## No infrastructure setup

A normal UADI workflow does not require a UADI account or hosted service, backend, database, identity provider, signing key or MCP server. Use the project's existing Git workflow for history and collaboration.

## Optional validation tools

The repository includes scripts, schemas and a React renderer. Use them when the project needs structured artifacts or executable prototype validation. They are development aids, not prerequisites for design assistance.

## Safe execution

Follow the host environment's normal security controls. Do not expose production secrets to generated code or run untrusted generated code in privileged environments. UADI does not provide a hardened multi-tenant sandbox.
