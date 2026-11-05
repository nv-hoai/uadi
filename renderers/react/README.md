# UADI React renderer
A first renderer for validated UDS artifacts. It maps stable catalog IDs to React components, provides page navigation and controlled form-field state, and exposes navigation/field-change callbacks. It is a prototype renderer, not a production application framework.
## Usage contract
- Render UadiPrototype with a schema-validated UdsSpecification.
- Use page_id values as navigation destinations for in-prototype navigation.
- Supply onNavigate and onFieldChange callbacks to integrate host behavior.
- Import src/styles.css from the consuming application for responsive starter styling and visible focus states.
- Unsupported catalog IDs fail explicitly; do not silently substitute arbitrary markup.
## Checks
Run npm install, npm run typecheck, and npm run build in this directory. The build emits ES modules and declarations to dist/. Generated source remains untrusted and must be built in a constrained environment without production secrets.
