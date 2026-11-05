# Artifact Validation

## Requirements
- Node.js 20 or newer.
- npm.

## Install
```bash
npm install
```

## Run tests
```bash
npm test
```

## Validate JSON artifacts
The validator maps an artifact filename to a schema with the same basename under `schemas/`.

```bash
npm run validate -- examples/minimal/project-context.json examples/minimal/discovery-result.json
```

For example, `project-context.json` is checked against `schemas/project-context.schema.json`.

## Contract discipline
- Schemas use JSON Schema Draft 2020-12.
- Current contract version is `1.0.0`.
- Keep fixtures for both valid and invalid cases.
- Treat schema changes as compatibility changes: document the reason, update fixtures, and provide migration notes where existing artifacts may be affected.
- A successful schema check confirms structural validity only. It does not prove UX quality, authorization, accessibility conformance, or runtime behavior.
