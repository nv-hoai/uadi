# AGENTS.md — UADI

UADI is a design-intelligence skill repo: markdown playbooks + JSON schemas + small Node
scripts + one React renderer. There is no backend, server, or database. `SKILL.md` is the
agent entry point; `docs/DESIGN-INTELLIGENCE.md` is the canonical source of truth for
principles — read it before changing any guidance docs.

## Tooling (mise)

- Tools (node, gh, …) are managed by **mise** via the global config
  (`~/.config/mise/config.toml`); this repo has no `mise.toml` of its own. Make sure mise
  shims are on `PATH` (or run commands via `mise exec -- …`). Do not install Node or gh
  manually. CI uses Node 24; mise provides node `lts` locally.
- Lockfiles are committed for both package roots (`package-lock.json`). Use `npm ci` for
  reproducible installs; do not regenerate lockfiles casually.

## Issues and PRs

- Work is tracked as GitHub issues. Pick up / resolve them with the `gh` CLI:
  `gh issue list`, `gh issue view <n>`. Reference the issue in the PR description
  (`fixes #<n>`) so it auto-closes. Open an issue before large changes to schemas,
  workflows, or architecture (see `CONTRIBUTING.md`).

## Commands

Root (after `npm ci`):

```bash
npm test                                        # node --test, runs tests/*.test.mjs
npm run validate -- <artifact.json>             # JSON Schema validation (ajv)
npm run prototype:check -- <uds.json>           # full UDS schema + renderer contract check
npm run benchmark:prepare / npm run benchmark:score
npm run install:skill -- --agent codex          # install skill into a host agent
```

React renderer (`renderers/react/`, separate package):

```bash
npm ci
npx playwright install --with-deps chromium    # required once before browser tests
npm run typecheck && npm run build              # build emits to dist/ (gitignored)
npm test                                        # playwright: a11y, keyboard, screenshots, responsive
npx playwright test --update-snapshots          # accept intentional visual changes, then inspect
npm run dev                                     # demo at http://127.0.0.1:4173/
```

Screenshot baselines live in `renderers/react/tests/prototype.spec.ts-snapshots/` and use a
2% pixel-difference budget. Review updated baselines before committing them.

CI (`.github/workflows/ci.yml`) mirrors this: root `npm test` + validate of
`examples/minimal/project-context.json` and `component-catalog/catalog.json`, then the
renderer job above. Run the matching checks locally before opening a PR.

## Layout

- `schemas/` — JSON Schemas for all UDS artifacts; `templates/` — starter YAML/JSON contexts.
- `component-catalog/catalog.json` — stable component IDs; the React renderer maps these
  IDs to components and **fails explicitly on unsupported IDs** (never silently substitute).
- `intelligence/` — playbooks + `patterns/`; `workflows/` — task workflows; `docs/` — vision,
  architecture, integration, quality gates; `examples/` — valid artifact examples
  (`examples/minimal/` is the minimal valid set).
- `scripts/` — plain Node ESM (repo root package is `"type": "module"`); only devDeps are
  ajv + ajv-formats. Tests are `tests/*.test.mjs` using `node:test` — no framework.
- `renderers/react/` — Vite + React 19 + TS prototype renderer (not a production framework).

## Conventions

- Root and renderer are both ESM; no linter/formatter is configured — match surrounding style.
- `node_modules/`, `**/dist/`, `benchmarks/runs/` are gitignored — never commit them.
- Keep the core agent-agnostic: no required backend, API keys, MCP server, or hosted service.
- Never claim a check passed unless you actually ran it (`docs/QUALITY-GATES.md`).
- Generated renderer output is untrusted: build/run it only in a constrained environment
  without production secrets.
