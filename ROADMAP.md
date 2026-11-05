# UADI MVP Roadmap

This roadmap tracks implementation in the repository. A checkbox means the corresponding artifact or capability exists; it does not imply production-grade validation unless tests are documented.

## Phase 1 — Foundation
- [x] Portable entry skill and core principles
- [x] Project context schema and template
- [x] Discovery workflow and structured result schema
- [x] JSON Schemas and Node/AJV validation script
- [x] Initial product and architecture documentation
- [ ] Feature context template and complete example project
- [ ] Automated schema fixture tests in CI

Exit: an agent can inspect a project, identify known facts and gaps, ask focused questions, and save a validated design brief.

## Phase 2 — Design intelligence
- [x] UX/UI analysis artifact schema and workflow
- [x] Proposal schema and concept-generation workflow
- [x] Rationale, assumptions, risks, and trade-offs represented
- [x] UADI Design Specification (UDS) schema and compiler workflow
- [ ] Proposal comparison rubric and worked example

Exit: an owner can compare structured design directions and select one for specification.

## Phase 3 — Prototype and iteration
- [ ] Component catalog contract and starter catalog
- [ ] React + TypeScript renderer
- [ ] Basic navigation and interactions
- [ ] Prototype build validation
- [x] Feedback schema
- [ ] Immutable revision workflow and fixture tests

Exit: an owner can inspect a prototype and request a revision without overwriting history.

## Phase 4 — Approval and design system
- [x] Explicit owner approval record schema
- [x] Design configuration schema
- [ ] Configuration resolver (UADI defaults → project → feature)
- [ ] Non-overridable constraints enforced by tests
- [ ] Rule validation and rollback guidance

## Phase 5 — Agent integrations
- [ ] Generic integration guide
- [ ] Host-specific adapters (Cursor, Claude Code, Codex)
- [ ] Optional MCP tools/resources
- [ ] Cross-agent compatibility tests

## Non-goals for initial MVP
Hosted design SaaS, mandatory backend, UADI-owned LLM, mandatory MCP/A2A, multiple renderers, multi-agent concurrent writes, and automated approval.
