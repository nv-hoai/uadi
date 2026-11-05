# Optional Continuous Governance

This document describes optional practices for teams that need repeatable cross-feature quality checks. None of these practices is required for ordinary UADI use.

## Lightweight starting point

- Keep design tokens and reusable patterns in the project repository.
- Review meaningful changes against the current product conventions.
- Run the project's existing tests and accessibility checks.
- Use Git history and pull requests to discuss and preserve decisions.

## Advanced capabilities

The repository includes optional utilities and contracts for immutable evidence, signed gate attestations, quality scoring, drift reports and release aggregation. Teams may adopt them when their risk, scale or compliance needs justify the extra setup.

## Important boundaries

- A model's self-review is not independent test evidence.
- Git history records changes but does not by itself prove a human approval event.
- Signed attestations require a trusted host evaluator and protected key management.
- Running untrusted generated source requires a separately hardened execution environment.
- Continuous regression and evidence retention require host CI/storage choices.

Do not introduce identity systems, signing infrastructure, dashboards or schedulers unless a concrete project requirement calls for them.
