# Cursor

Install from the UADI repository root:

```bash
node scripts/install-skill.mjs --agent cursor
```

This copies the skill to `.cursor/skills/uadi/` in the current project. Cursor Agent can use project-level skills from this directory. If it is already running and does not discover the skill, refresh the project or start a new Agent session and ask it to use UADI.

To update the installed skill, rerun the command. Existing files are preserved; add `--force` to replace them.

See [adapter overview](../README.md) for all supported hosts.
