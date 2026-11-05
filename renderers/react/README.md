# UADI React renderer
A first renderer for validated UDS artifacts. It maps stable catalog IDs to React components, provides page navigation and controlled form-field state, and exposes navigation/field-change callbacks. It is a prototype renderer, not a production application framework.
## Contract
- Call UadiPrototype with a validated UdsSpecification.
- Use page_id values as navigation destinations for in-prototype navigation.
- Supply onNavigate and onFieldChange callbacks to integrate host behavior.
- Unsupported catalog IDs fail explicitly; do not silently substitute arbitrary markup.
- Run npm install and npm run typecheck in this directory.
Generated source remains untrusted and must be built in a constrained environment without production secrets.
