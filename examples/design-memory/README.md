# Project design memory example

This example shows the repository-native memory artifact with approved constraints and decisions, a rejected direction, an open question and a proposed-but-not-approved idea.

- `design-memory.json` — source of record, validated by `schemas/design-memory.schema.json`.
- `DESIGN-MEMORY.md` — generated compact brief (about 350 estimated tokens). Agents read this, not the full JSON.

Regenerate the brief:

```bash
node scripts/design-memory.mjs validate --file examples/design-memory/design-memory.json
node scripts/design-memory.mjs brief --file examples/design-memory/design-memory.json --out examples/design-memory/DESIGN-MEMORY.md
```

The proposed annual-billing entry stays a hypothesis. It never becomes a constraint until an owner approves it. The open question stays visible until the product rule is answered.

In a host project, use `.uadi/design-memory.json` and `.uadi/DESIGN-MEMORY.md`; see [the workflow](../../workflows/design-memory.md).
