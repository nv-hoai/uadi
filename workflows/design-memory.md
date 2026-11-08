# Workflow: Design Memory

Use project-level design memory to avoid re-discovering settled context and re-litigating rejected directions. Memory is a repository artifact, not a service.

## Files

- `.uadi/design-memory.json` — source of record, validated against `schemas/design-memory.schema.json`.
- `.uadi/DESIGN-MEMORY.md` — generated compact brief, the only file an agent normally reads at task start.

Git is the history. Do not create a second database, approval service or sync mechanism.

## At task start

1. If `.uadi/DESIGN-MEMORY.md` exists, read it before inspecting the product.
2. If only the JSON exists, run `node scripts/design-memory.mjs brief --file .uadi/design-memory.json --out .uadi/DESIGN-MEMORY.md` when the repository provides the tooling, or read the JSON directly.
3. Treat `APPROVED` entries as constraints and decisions. Treat `PROPOSED` entries as hypotheses, not requirements.
4. Exclude `SUPERSEDED` and `EXPIRED` entries. Flag stale entries whose `review_after` has passed.
5. If memory conflicts with the current repository or the owner's instruction, stop and surface the conflict; do not silently choose one.

## At task end

Propose an entry only when the decision is durable and future work would otherwise repeat the reasoning. Good candidates:

- a constraint from the owner or product rule;
- a design decision with a rejected alternative;
- a rejected direction and why it lost;
- an open question that blocks a future decision;
- a preference that changes future composition.

Do not record transient task detail, draft copy, secrets, personal data, analytics guesses or speculative research. Store an evidence pointer (path, URL, ticket) rather than a dump.

## Entry rules

- `PROPOSED` entries may be appended by an agent but never become constraints automatically.
- Only an owner may move an entry to `APPROVED`, with `approved_by` and `approved_at`.
- A new decision that replaces an old one must name it in `supersedes`; retain the old entry for provenance.
- Use `review_after` for assumptions that could become stale. Reviewing is not automatic expiry.
- Keep the active brief small: target 400–700 tokens. When it grows, compact superseded/expired entries and merge duplicates.

## Commands (repository tooling)

```bash
node scripts/design-memory.mjs init --file .uadi/design-memory.json --project-id <id>
node scripts/design-memory.mjs validate --file .uadi/design-memory.json
node scripts/design-memory.mjs brief --file .uadi/design-memory.json --out .uadi/DESIGN-MEMORY.md
```

Host projects without the UADI repository can read the JSON/Markdown directly; the schema and workflow are portable.

## Precedence

1. Owner-approved entry beats an inferred entry.
2. A newer approved entry supersedes an older one only through explicit `supersedes`.
3. Repository evidence is evidence, not a decision.
4. Unresolved conflicts are flagged, never averaged or hidden.
5. Inferred entries never become constraints without approval.
