# Context-efficiency smoke test

**Status: Stage 0 probe + Stage 2 re-run.** This is not a quality study and not the formal B/C evaluation. It checks read-event instrumentation and compares the pre-Stage-2 playbook path with the current kernel/module path.

## Protocol

- One session per task class, same host/model where possible.
- UADI guidance is read through `scripts/context-read.mjs`, so every read is logged.
- The task is a short design plan, not a full implementation, to isolate the loading path.
- The agent writes no context log; the wrapper emits events and the validator generates the report.
- Any session that bypasses the wrapper is labelled `self_reported` or excluded from the instrumented baseline.

## Stage 0 runs (historical)

| Run | Class | Task | Log | Report | Evidence tier |
|---|---|---|---|---|---|
| `medium` | Medium screen/flow | Improve the subscription settings experience | `logs/medium.jsonl` | `reports/medium.md` | `wrapper` |
| `complex` | Complex flow | Design first-run onboarding with roles and optional invitations | `logs/complex.jsonl` | `reports/complex.md` | `wrapper` |

| Run | Events | Distinct files | Est. tokens read | Repeated reads |
|---|---:|---:|---:|---:|
| `medium` | 6 | 6 | 9,597 | 0 |
| `complex` | 6 | 6 | 10,372 | 0 |

The historical path read `SKILL.md`, `docs/DESIGN-INTELLIGENCE.md` and the monolithic UX Reasoning playbook (5,405 estimated tokens alone). Pattern reads were selective; the medium run also opened one worked-example README.

## Stage 2 runs

| Run | Class | Task | Log | Report | Evidence tier |
|---|---|---|---|---|---|
| `medium-stage2` | Medium screen/flow | Same subscription settings task | `logs/medium-stage2.jsonl` | `reports/medium-stage2.md` | `wrapper` |
| `complex-stage2` | Complex flow | Same onboarding task | `logs/complex-stage2.jsonl` | `reports/complex-stage2.md` | `wrapper` |

| Run | Events | Distinct files | Est. tokens read | Change vs Stage 0 |
|---|---:|---:|---:|---:|
| `medium-stage2` | 5 | 5 | 2,612 | −73% |
| `complex-stage2` | 4 | 4 | 2,819 | −73% |

Both Stage 2 runs read the 697-token kernel plus two modules (and one risk card where triggered) plus one pattern. They did not read the core or the monolithic playbooks. No repeated reads occurred.

## What this does and does not show

It shows the loading path changed materially on two representative tasks and the instrumentation works end to end. It does **not** show quality is preserved: the plans were not scored. It is not natural host telemetry; sessions were instructed to use the wrapper. It has no provider token, cost or peak-occupancy data, and two sessions are a probe rather than a distribution.

Stage 4 must pair this context reduction with a pre-registered quality non-inferiority test before any efficiency claim is made.

## Reproduce

```bash
npm run context:report
npm run context:validate -- --log benchmarks/context-smoke/logs/medium.jsonl --check-paths --out benchmarks/context-smoke/reports/medium.md
npm run context:validate -- --log benchmarks/context-smoke/logs/complex.jsonl --check-paths --out benchmarks/context-smoke/reports/complex.md
npm run context:validate -- --log benchmarks/context-smoke/logs/medium-stage2.jsonl --check-paths --out benchmarks/context-smoke/reports/medium-stage2.md
npm run context:validate -- --log benchmarks/context-smoke/logs/complex-stage2.jsonl --check-paths --out benchmarks/context-smoke/reports/complex-stage2.md
```

To run a new probe, use `scripts/context-read.mjs` for every UADI guidance read and label the session `wrapper` unless the host emits its own events. Do not describe a wrapper probe as natural host telemetry.
