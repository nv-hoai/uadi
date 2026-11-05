# UADI React renderer

A first renderer for validated UDS artifacts. It maps stable catalog IDs to React components, provides page navigation and controlled form-field state, and exposes navigation/field-change callbacks. It is a prototype renderer, not a production application framework.

## Usage contract

- Render UadiPrototype with a schema-validated UdsSpecification.
- Use page_id values as navigation destinations for in-prototype navigation.
- Supply onNavigate and onFieldChange callbacks to integrate host behavior.
- Import src/styles.css from the consuming application for responsive starter styling and visible focus states.
- Unsupported catalog IDs fail explicitly; do not silently substitute arbitrary markup.

## Reference example

Run `npm install && npm run dev` from this directory, then open:

- `http://127.0.0.1:4173/` — minimal UDS renderer example.
- `http://127.0.0.1:4173/subscription-settings` — responsive subscription settings reference experience.

The subscription example demonstrates plan limits, billing cadence, owner/member permissions, invoice/payment information, and a consequence-aware cancellation dialog. Its prices and account details are illustrative; it does not connect to a payment provider or modify a real subscription. See [the design notes](../../examples/subscription-settings/README.md).

## Checks

Run `npm install`, `npm run typecheck`, and `npm run build` in this directory. Browser tests cover keyboard interaction, accessibility, responsive behavior and cancellation flow. The build emits ES modules and declarations to dist/. Generated source remains untrusted and must be built in a constrained environment without production secrets.
