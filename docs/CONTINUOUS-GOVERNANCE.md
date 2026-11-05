# UADI Evidence-Based Quality and Continuous Governance

## Evidence model
Each evaluation creates an immutable evidence record bound to artifact ID, version and SHA-256 content digest. Evidence includes evaluator type, run ID, timestamp, check outcomes and report/log references. A changed digest makes prior evidence stale for release decisions.

## Quality dimensions
Projects may score usability, requirement coverage, consistency, accessibility, responsive behavior, maintainability and risk. Scores use explicit weights and a 1–5 scale. Every dimension needs supporting evidence; the aggregate score never overrides hard blockers or owner approval.

## Design drift
Compare the candidate configuration with the last approved baseline. Classify changed paths as:
- BLOCK: protected or NON_OVERRIDABLE paths changed.
- WARNING: governed design tokens, patterns or component contracts changed.
- INFO: permitted evolution with no protected policy impact.

Drift detection reports differences; policy determines whether they require review, re-approval or rejection. It must not silently rewrite the approved baseline.

## Regression strategy
- Re-run schema, governance and renderer contract checks on every relevant change.
- Run component-level interaction/accessibility tests when a catalog component changes.
- Run responsive and visual checks for supported viewport/browser combinations.
- Compare feature changes against project-level design configuration.
- Preserve prior approved baselines and create new versioned baselines only after owner approval.

## Operational metrics
Track gate pass/fail/block rates, stale evidence rate, escaped regressions, owner change-request rate, time-to-approval and recurring accessibility/visual findings. Metrics are trend signals, not substitutes for individual review.

## Limits
Cross-feature monitoring requires a host scheduler or CI trigger. Live identity-provider verification, browser matrix execution and isolated execution require host infrastructure. UADI defines portable contracts and local evaluators; it does not ship a mandatory backend or hosted control plane.
