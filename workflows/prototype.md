# Workflow: Prototype

## Preconditions
A selected proposal and validated UDS revision exist. The owner has authorized prototype generation.

## Procedure
1. Read UDS and the component catalog; do not infer component APIs from their names.
2. Map stable catalog component IDs to the selected renderer (React + TypeScript is the first target).
3. Generate the smallest prototype that demonstrates the key user journey and critical states.
4. Include loading, empty, error, success, and disabled states where relevant.
5. Implement keyboard access, semantic structure, responsive behavior, and visible focus.
6. Run formatter, type checker, build, and available accessibility checks in a constrained environment.
7. Record source revision, build result, validation findings, and preview instructions.
8. Mark the prototype ready only when the required checks pass; otherwise report failures and limitations.

## Safety
Treat generated source as untrusted. Do not execute it with production credentials, privileged host access, or real customer data. Never publish generated code automatically.
