# Claude Code

Install from the UADI repository root:

```bash
node scripts/install-skill.mjs --agent claude
```

This copies the skill to `.claude/skills/uadi/` in the current project. Claude Code can discover project-level skills from this directory. If it is already running and does not discover the skill, start a new session and ask it to use UADI.

To update the installed skill, rerun the command. Existing files are preserved; add `--force` to replace them.

See [adapter overview](../README.md) for all supported hosts.
