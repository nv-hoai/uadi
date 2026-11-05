# Workflow: Compile UDS

Compile the owner-selected proposal into framework-neutral UADI Design Specification (UDS).

1. Confirm the selected proposal ID and exact version.
2. Define target platform and viewports.
3. Define semantic design tokens and page/section structure.
4. Reference components by stable catalog IDs, never React component names.
5. Specify interactions, state changes, keyboard behavior, responsive behavior, and accessibility requirements.
6. Trace each major requirement to one or more specification elements.
7. Validate against design-specification.schema.json.
8. Record unresolved implementation questions; do not silently invent component capabilities.

UDS expresses design intent. A renderer maps it to React, Vue, native UI, or another target.
