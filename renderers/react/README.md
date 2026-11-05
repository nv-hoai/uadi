# UADI React Renderer (prototype)

This is the first framework adapter for rendering a subset of UDS component IDs as a static React preview.

## Scope
- Maps stable catalog IDs to React elements.
- Fails explicitly for unsupported component IDs rather than silently dropping them.
- Renders basic semantic landmarks and placeholder controls for the starter catalog.

## Limitations
This is a renderer foundation, not a production UI kit. It does not yet implement real application state, navigation routing, form submission, visual token theming, responsive CSS, or automated accessibility conformance. The generated UI must be completed and tested for the target product.

## Check
```bash
npm install
npm run typecheck
```
