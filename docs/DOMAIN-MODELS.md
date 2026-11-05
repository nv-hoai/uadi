# UADI Domain Models

## Core entities
- ProjectContext: product purpose, users, goals, platforms, constraints, preferences, and provenance.
- FeatureContext: feature scope, user tasks, constraints, and parent project reference.
- DesignSession: lifecycle state and artifact references for one design effort.
- DiscoveryResult: known facts, unknowns, assumptions, questions, and readiness.
- DesignAnalysis: user needs, requirements, UX opportunities, risks, and constraints.
- DesignProposal: distinct direction, rationale, visual/interaction intent, and trade-offs.
- DesignSpecification (UDS): framework-neutral pages, sections, components, tokens, interactions, and responsive/accessibility requirements.
- PrototypeArtifact: generated source, build status, preview instructions, and validation findings.
- DesignFeedback: reviewer, target version, categorized requests, and decision.
- DesignConfiguration: reusable tokens, patterns, component rules, UX rules, and inheritance metadata.
- ValidationReport: relevant checks, findings, severity, and remediation guidance.

## Relationships
Project → Features, Sessions, Project Configurations.
Session → Discovery Result → Analysis → Proposal(s).
Proposal → UDS → Prototype(s).
Proposal → Feedback and subsequent Git revisions.
Feature Configuration inherits Project Configuration and applies permitted overrides.

## Versioning

Use Git commits and pull requests as the default revision history. Give important design artifacts clear names and preserve meaningful alternatives when comparison matters. Avoid custom revision ledgers or immutable version machinery unless a concrete integration requires them.

## Provenance

For important context fields, preserve whether a value came from an owner, repository inspection, an external source, or an agent assumption. Record confidence where useful. Never present assumptions as confirmed requirements.
