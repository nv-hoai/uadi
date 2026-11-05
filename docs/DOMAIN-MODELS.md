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
- ApprovalRecord: approver, proposal/version, decision, timestamp, and note.
- DesignConfiguration: approved tokens, patterns, component rules, UX rules, and inheritance metadata.
- ValidationReport: checks, findings, severity, evidence, and remediation guidance.

## Relationships
Project → Features, Sessions, Project Configurations.
Session → Discovery Result → Analysis → Proposal(s).
Proposal → UDS → Prototype(s).
Proposal version → Feedback and revisions.
Proposal version → Approval Record → Published Design Configuration.
Feature Configuration inherits Project Configuration and applies permitted overrides.

## Versioning
Every artifact includes schema_version. Proposal versions are immutable integers. Configurations have immutable version identifiers. Feedback and approval target exact proposal versions. Schema changes require migration notes and compatibility tests.

## Provenance
For important context fields, preserve whether a value came from an owner, repository inspection, an external source, or an agent assumption. Record confidence where useful. Never present assumptions as confirmed requirements.
