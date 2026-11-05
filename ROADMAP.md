# UADI MVP Roadmap
A checkbox indicates an implemented and repository-backed capability; it does not imply enterprise production readiness.
## Phase 1 — Foundation
- [x] Portable skill, principles, project context, discovery, schemas, validation, examples and CI.
## Phase 2 — Design intelligence
- [x] Analysis, proposal generation, comparison rubric, UDS contract and compiler workflow.
## Phase 3 — Prototype and iteration
- [x] Component catalog and React renderer with page navigation and controlled field state.
- [x] Prototype contract checker and CI tests.
- [x] Feedback workflow and immutable revision runtime with parent linkage and SHA-256 integrity.
- [ ] Full production component library, visual regression, browser accessibility automation and sandboxed preview hosting.
## Phase 4 — Approval and design system
- [x] Approval and design configuration schemas/workflows.
- [x] Configuration resolver with Feature > Project > Defaults precedence.
- [x] NON_OVERRIDABLE baseline enforcement and override validation.
- [x] Governance validation and rollback procedure.
- [ ] Host-provided authenticated approval integration and policy-specific compliance packs.
## Phase 5 — Agent integrations
- [x] Generic integration contract and Cursor, Claude Code, Codex adapter guidance.
- [x] Optional MCP positioning and agent-agnostic compatibility contract.
- [ ] Automated compatibility tests against live host products (requires host environments and credentials).
## Remaining external/productization work
UADI's portable embedded MVP is implemented. Production deployment still requires a host-selected sandbox, real browser/accessibility test runner, owner identity provider, and host-specific compatibility environments. These cannot be truthfully completed from repository-only changes.
