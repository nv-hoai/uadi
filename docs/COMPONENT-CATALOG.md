# UADI Component Catalog Contract

## Purpose
The catalog is the renderer-independent vocabulary used by UDS. A UDS section references a stable `component_id`; adapters map that ID to React, Vue, native UI, or another renderer.

## Entry contract
Each catalog entry should define:
- `component_id`: stable, namespaced identifier (for example `uadi.layout.page-shell`).
- `name` and `category`.
- `purpose` and supported `slots`.
- `props`: semantic prop names, types, defaults, and constraints.
- `variants` and allowed values.
- `states`: loading, empty, error, disabled, selected, and other relevant states.
- `accessibility`: semantic role, accessible-name expectations, keyboard behavior, and focus rules.
- `responsive_behavior`.
- `renderer_mappings`: optional implementation-specific mapping kept outside UDS.

## Stability
Do not rename or repurpose a published component ID. Deprecate it with a replacement ID and migration note. A renderer must report unsupported components or props rather than silently dropping behavior.

## Separation of concerns
Catalog IDs are not React component names. UDS describes intent and required behavior; renderer adapters own framework syntax and implementation details.
