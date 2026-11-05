# Workflow: Resolve design configuration

When a project has multiple layers of design guidance, apply this precedence:

**Feature Override > Project Configuration > UADI Defaults**

Deep-merge token objects; scalar and array values are replaced by the higher-precedence layer. Project-level brand, accessibility and security constraints should not be weakened by a feature-specific preference.

Use the project's existing configuration files as the source of truth. If two instructions conflict and the higher-priority rule is unclear, explain the conflict and ask the owner rather than inventing a new approval or publication process.
