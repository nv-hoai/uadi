# UADI Minimal Example

This example is intentionally small and illustrative. It is not user research or a real product specification.

## Contents
- `project-context.json`: a project context fixture.
- `discovery-result.json`: a discovery result with explicit facts, assumptions, unknowns, and a blocking question.

## Validate
From the repository root:

```bash
npm ci
npm run validate -- examples/minimal/project-context.json examples/minimal/discovery-result.json
```

The example discovery is intentionally `BLOCKED`: the owner must confirm the priority tasks before analysis proceeds.
