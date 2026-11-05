# Workflow: Resolve design configuration

When a project has multiple layers of design guidance, use this precedence:

1. **NON_OVERRIDABLE constraints** — accessibility, security, legal requirements and explicitly protected brand/product constraints. These always win.
2. **Feature Override** — feature-specific preferences that do not violate protected constraints.
3. **Project Configuration** — project-wide design system, brand and product conventions.
4. **UADI Defaults** — fallback guidance when the project does not define a preference.

Within the same precedence level, prefer the more specific applicable rule. A higher layer may replace an ordinary lower-level preference, but it cannot weaken a NON_OVERRIDABLE constraint.

Use the project's existing configuration files as the source of truth. Do not require a dedicated configuration service or invent files for a one-off task. If two equally authoritative instructions conflict and the correct interpretation is unclear, explain the conflict and ask the owner.
