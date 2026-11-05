# UADI Product Vision

## Vision
Make high-quality UX/UI design capability portable across AI agents. UADI embeds a disciplined design process into an existing agent rather than introducing another agent, hosted platform, or mandatory backend.

## Problem
AI agents can generate screens quickly, but project context, design rationale, interaction behavior, accessibility constraints, and approval decisions are often scattered across chat history. This causes repeated questions, inconsistent interfaces, and accidental promotion of suggestions into permanent design rules.

## Product promise
UADI turns design work into explicit, versioned project artifacts that any compatible agent can inspect, validate, continue, and improve.

## Primary users
- Product owners who need to make and retain design decisions.
- Product teams using coding agents to explore and implement UX/UI.
- Agent/tool builders who want a reusable design capability without adopting a specific model framework.

## Non-goals
- A standalone conversational agent or design SaaS.
- A replacement for Figma or a full visual design editor.
- A mandatory database, API server, MCP server, or agent framework.
- Automatic approval or autonomous publication of design rules.
- A promise that generated prototypes are production-ready.

## Product principles
1. Agent-, model-, and framework-agnostic core.
2. Repository-first persistence; Git provides history.
3. Discovery before detailed design; ask only decision-relevant questions.
4. Generate alternatives with explicit rationale and trade-offs.
5. Keep design intent in framework-neutral UDS.
6. Make every proposal and revision traceable.
7. The authorized human owner is the final decision-maker.
8. Accessibility, security, and brand constraints may be non-overridable.
9. Validate artifacts and generated code; never equate generation with correctness.

## Success criteria
A second compatible agent can continue a design session from repository artifacts alone; proposals can be compared; UDS can be validated; prototype revisions remain traceable; and only an authorized owner decision for an exact proposal version can publish configuration.
