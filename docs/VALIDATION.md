# Validation

UADI keeps validation proportional to the work. Use the checks that fit the artifact or implementation being changed.

## Repository checks

- JSON Schema validation: `npm run validate -- <artifact.json>`
- Unit and fixture tests: `npm test`
- Prototype contract: `npm run prototype:check -- <uds.json>`
- Context audit: `npm run context:report` (static `chars/4` estimate, not provider tokens)
- Context log validation: `npm run context:validate -- --log <events.jsonl>`
- React renderer types/build: `npm run typecheck && npm run build` in `renderers/react`

## Host-required checks

A host integration may add browser accessibility, responsive viewport, keyboard interaction and visual regression checks. Execution of generated source requires a separately isolated environment controlled by the host.

## Review and history

Use the project's normal human review, Git and pull request process. UADI does not require a separate approval record, release gate evaluator, signed evidence ledger or custom rollback runtime.
