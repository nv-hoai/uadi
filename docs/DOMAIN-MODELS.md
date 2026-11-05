# UADI Domain Models

UADI uses lightweight, portable data shapes when they help an agent preserve design intent. These are artifact contracts, not a required runtime, database model or mandatory lifecycle.

## Core artifacts

- **ProjectContext:** product purpose, users, goals, platforms, constraints, preferences and provenance.
- **FeatureContext:** feature scope, user tasks, constraints and optional parent-project reference.
- **DiscoveryResult:** known facts, unknowns, assumptions, questions and readiness.
- **DesignAnalysis:** user needs, requirements, UX opportunities, risks and constraints.
- **DesignProposal:** a design direction, rationale, visual/interaction intent and trade-offs.
- **DesignSpecification (UDS):** framework-neutral pages, sections, components, tokens, interactions, responsive and accessibility requirements.
- **PrototypeArtifact:** optional reference to generated source, build status, preview instructions and validation findings.
- **DesignFeedback:** optional feedback associated with a design artifact.
- **DesignConfiguration:** reusable tokens, patterns, component rules and UX rules.
- **ValidationReport:** optional record of relevant checks, findings, severity and remediation guidance.

Use only the artifacts that provide value for the task. A small interface change may need no formal discovery, proposal, UDS or feedback file.

## Relationships

A project may contain feature context and reusable design configuration. A substantial design task may move from discovery to analysis, one or more proposals, a UDS specification and a prototype. Feedback can inform a later revision.

These relationships describe useful information, not a prescribed state machine. Agents should adapt the sequence to the work instead of manufacturing sessions, status transitions or approval records.

## Versioning

Use Git commits and pull requests as the default revision history. Give important design artifacts clear names and preserve meaningful alternatives when comparison matters. Avoid custom revision ledgers, mandatory immutable version machinery or separate approval state unless a concrete integration requires them.

## Provenance

For important context fields, preserve whether a value came from an owner, repository inspection, an external source or an agent assumption. Record confidence where useful. Never present assumptions as confirmed requirements.
