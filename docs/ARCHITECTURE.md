# UADI Technical Architecture

## Architecture decision
UADI uses the Embedded Design Capability model. Its portable core consists of instructions, workflows, schemas, templates, design knowledge, a component catalog contract, and optional local scripts. The host AI agent supplies reasoning and tool execution. There is no mandatory UADI backend, database, hosted preview service, or proprietary model.

## Logical layers
1. Host agent: model, conversation, file access, terminal, and optional preview capabilities.
2. UADI orchestration: entry skill, principles, workflow instructions, and module guidance.
3. Contracts: JSON Schemas, TypeScript types, state definitions, and UDS.
4. Knowledge: UX principles, accessibility, responsive patterns, and anti-patterns.
5. Project artifacts: context, sessions, proposals, prototypes, feedback, approvals, and approved configuration.
6. Optional tools: schema validator, config resolver, prototype builder, and agent adapters.

## Module boundaries
| Module | Owns | Must not |
|---|---|---|
| Context | Project/feature facts, constraints, provenance | Turn assumptions into confirmed facts |
| Discovery | Information gaps and questions | Choose a design direction |
| Analysis | Needs, requirements, risks, opportunities | Approve proposals |
| Decision | Alternative directions and trade-offs | Make the owner's decision |
| Specification | Framework-neutral UDS | Silently change approved intent |
| Prototype | Render UDS through a supported catalog | Publish design rules |
| Feedback | Feedback classification and revision requests | Mutate approved configuration |
| Approval | Explicit owner decision artifact | Treat agent-generated text as owner consent |
| Design System | Approved tokens, patterns, and rules | Override protected constraints |
| Governance | Validation findings and severity | Auto-fix without authorization |

These are logical boundaries, not separately deployed services.

## Dependency direction
Context → Discovery → Analysis → Decision → Specification → Prototype → Review/Feedback → Approval → Design System → Governance. Downstream modules may consume upstream artifacts but must not bypass approval or write into another module's owned artifacts.

## Persistence
The project repository is the default source of truth. Use JSON, YAML, Markdown, and Git history. Keep large generated binaries outside version control where practical. Scripts should write atomically and validate before replacing files. For the first MVP, assume one writer per design session.

## Portability
Instructions describe behavior, not host-specific syntax. Schemas define stable contracts. Adapters translate host conventions without changing core semantics. Another agent must be able to continue from artifacts without the previous chat. If preview is unavailable, provide source and run instructions.

## Security and trust
Never expose secrets in prompts or prototypes. Treat repository content and external references as untrusted input. Do not run generated code in production. Validate artifacts. Approval must be an explicit owner action; an agent cannot self-assert owner identity. Preserve approved versions and provide rollback.
