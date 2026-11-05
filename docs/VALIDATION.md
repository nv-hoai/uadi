# Validation and governance
UADI separates portable checks from checks that require a host environment.
## Repository checks
- JSON Schema validation: npm run validate -- <artifact.json>
- Unit/fixture tests: npm test
- Prototype contract: node scripts/prototype-check.mjs <uds.json>
- React renderer types: npm install && npm run typecheck in renderers/react
## Host-required checks
A host integration should run production build, browser accessibility, responsive viewport, keyboard interaction, visual regression, and sandbox security checks. These are not asserted by repository-only CI.
## Approval and rollback
Approval must be verified by the host against the exact proposal ID/version. Rollback creates a new published revision referencing a previously approved configuration; history is never rewritten.
