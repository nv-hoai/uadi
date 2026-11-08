# Context-efficiency smoke test

**Status: Stage 0 probe.** This is not a quality study and not the formal B/C evaluation. It checks that read-event instrumentation works on representative task classes and records how much UADI guidance the current loading path pulls in.

## Protocol

- One session per task class, same host/model where possible.
- UADI guidance is read through `scripts/context-read.mjs`, so every read is logged.
- The task is a short design plan, not a full implementation, to isolate the loading path.
- The agent writes no context log; the wrapper emits events and the validator generates the report.
- Any session that bypasses the wrapper is labelled `self_reported` or excluded from the instrumented baseline.

## Runs

| Run | Class | Task | Log | Report | Evidence tier |
|---|---|---|---|---|---|
| `medium` | Medium screen/flow | Improve the subscription settings experience | `logs/medium.jsonl` | `reports/medium.md` | `wrapper` |
| `complex` | Complex flow | Design first-run onboarding with roles and optional invitations | `logs/complex.jsonl` | `reports/complex.md` | `wrapper` |

## Results

| Run | Events | Distinct files | Est. tokens read | Repeated reads |
|---|---:|---:|---:|---:|
| `medium` | 6 | 6 | 9,597 | 0 |
| `complex` | 6 | 6 | 10,372 | 0 |

What the probe shows:

- The kernel + core always-on baseline is 2,131 estimated tokens in both runs.
- The monolithic UX Reasoning playbook is the single largest read in both runs: 5,405 estimated tokens, 56% of the medium load and 52% of the complex load.
- Pattern reads were selective (one to three patterns), not a full-library load.
- No repeated file/section reads occurred in these two sessions.
- The medium run also opened one worked-example README (623 estimated tokens), which is reference material rather than a default runtime dependency.

What it does not show:

- It is not natural host telemetry. The sessions were instructed to read through the wrapper; a normal agent could read more, read less or repeat reads.
- It is not a quality comparison. The plans were not scored.
- It does not include provider input/output/cached tokens, peak occupancy or billed cost.
- Two sessions are a probe, not a baseline distribution.

## Reproduce

```bash
npm run context:report
npm run context:validate -- --log benchmarks/context-smoke/logs/medium.jsonl --check-paths --out benchmarks/context-smoke/reports/medium.md
npm run context:validate -- --log benchmarks/context-smoke/logs/complex.jsonl --check-paths --out benchmarks/context-smoke/reports/complex.md
```

To run a new probe, use `scripts/context-read.mjs` for every UADI guidance read and label the session `wrapper` unless the host emits its own events. Do not describe a wrapper probe as natural host telemetry.
