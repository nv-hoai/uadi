# Context log template

Context consumption is measured from **read events**, not from an agent-written summary. The event log is JSONL; the Markdown report is generated from it.

## Event format

One JSON object per line:

```json
{"ts":"2026-11-08T12:00:00.000Z","turn":4,"tool":"read","path":"intelligence/UX-REASONING-PLAYBOOK.md","section":"2. Map the task flow","bytes":5400,"tokens_est":1350,"source":"wrapper","note":"flow and recovery"}
```

| Field | Required | Meaning |
|---|---|---|
| `ts` | yes | ISO timestamp of the read |
| `turn` | yes | Conversation/tool turn, non-negative integer |
| `tool` | yes | Tool or method used (`read`, `wrapper`, host name) |
| `path` | yes | Safe relative path inside the project |
| `section` | no | Section or anchor read, when known |
| `bytes` | yes | UTF-8 byte size of the content read |
| `tokens_est` | yes | `chars/4` estimate, labelled as an estimate |
| `source` | yes | `host_event`, `wrapper` or `self_report` |
| `note` | no | Why the content was read |

`host_event` is the strongest source. `wrapper` means the read went through `scripts/context-read.mjs`. `self_report` means the agent wrote the event; it is format-validated only. Mixed logs are labelled `mixed`.

## Capturing events

Wrapper:

```bash
node scripts/context-read.mjs \
  --log benchmarks/context-smoke/logs/medium.jsonl \
  --turn 3 \
  --path intelligence/UX-REASONING-PLAYBOOK.md \
  --section "2. Map the task flow"
```

The wrapper prints the file content and appends one event. A host adapter can write the same event shape directly with `source: "host_event"`.

## Validating and reporting

```bash
npm run context:validate -- --log <events.jsonl> --check-paths
npm run context:validate -- --log <events.jsonl> --out <report.md>
```

The validator checks the event shape, safe relative paths, chronology, path existence, duplicate reads and the `bytes`/`tokens_est` relationship. It reports:

- estimated tokens read;
- distinct files and file/section pairs;
- repeated reads;
- event sources and evidence tier;
- explicit limits: no inferred peak occupancy, no provider cost unless joined separately.

## Report skeleton

The generated report follows this shape:

```markdown
# <run name>

Evidence tier: **wrapper**

## Summary
- Events: 12
- Distinct files: 3
- Distinct file/section pairs: 5
- Estimated tokens read: 8,240
- Sources: wrapper=12

## Files read
| File | Reads | Sections | Est. tokens |

## Repeated reads
| File | Section | Count |

## Limits
- A read event does not prove the model attended to every token.
- Peak context occupancy is not inferred from cumulative reads.
- Provider token and cost data require provider usage metadata.
```

Do not replace this generated report with a prose summary. Keep the event log alongside the report so the numbers can be re-derived.
