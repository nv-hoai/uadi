# UADI Three-Phase Roadmap

A checked item means the portable repository capability and its tests/contracts exist. It does not imply that host infrastructure, credentials or manual audits have been deployed.

## Phase 1 — MVP hardening
- [x] Embedded, agent-agnostic architecture and artifact-driven workflows.
- [x] Context/discovery/analysis/proposal/UDS schemas, validation and examples.
- [x] Component catalog and React/TypeScript renderer with typecheck/build.
- [x] Immutable revision chain with SHA-256 integrity and feedback lineage.
- [x] Configuration inheritance, NON_OVERRIDABLE enforcement, governance and rollback.
- [x] Exact proposal-version approval verification contract.
- [x] Ten-gate release contract, exact artifact binding and append-only evidence primitives.
- [x] Static secret/risky-source inspection with documented heuristic limitations.
- [ ] Host-provided authenticated identity integration.
- [ ] Hardened disposable runtime for executing arbitrary generated source.

## Phase 2 — Quality evaluation
- [x] Weighted quality scoring that requires evidence per dimension.
- [x] Gate evidence contract and Playwright Chromium smoke suite (keyboard, axe-core, responsive overflow, screenshot/visual comparison).
- [x] Protected-path design drift classification.
- [ ] Broader catalog component interaction and accessibility test coverage.
- [ ] Firefox/WebKit and multiple viewport visual baselines.
- [ ] Manual WCAG and assistive-technology audit on representative host products.

## Phase 3 — Evidence-based continuous governance
- [x] Immutable evidence record, duplicate prevention and artifact-digest freshness verification.
- [x] Ten-gate aggregation that blocks missing, stale, mismatched, duplicate or non-passing results.
- [x] Approved-baseline drift report and operational governance guidance.
- [ ] Host CI/scheduler integration for recurring cross-feature regression checks.
- [ ] Persistent evidence retention and operational dashboards in the host repository/tooling.
- [ ] Calibrated quality thresholds using real owner review outcomes.

## Current maturity
The portable foundations for all three phases are implemented. Phase 1 and Phase 2 still have explicit host/manual completion criteria; Phase 3 has the local evidence and drift primitives but not a deployed scheduler or monitoring service. UADI is an embedded capability package, not a hosted control plane, and should not be described as production-ready until the host-dependent items are satisfied.
