# UADI React renderer

A first renderer for validated UDS artifacts. It maps stable catalog IDs to React components, provides page navigation and controlled form-field state, and exposes navigation/field-change callbacks. It is a prototype renderer, not a production application framework.

## Usage contract

- Render UadiPrototype with a schema-validated UdsSpecification.
- Use page_id values as navigation destinations for in-prototype navigation.
- Supply onNavigate and onFieldChange callbacks to integrate host behavior.
- Import src/styles.css from the consuming application for responsive starter styling and visible focus states.
- Unsupported catalog IDs fail explicitly; do not silently substitute arbitrary markup.

## Reference example

Run `npm ci && npm run dev` from this directory, then open:

- `http://127.0.0.1:4173/` — minimal UDS renderer example.
- `http://127.0.0.1:4173/subscription-settings` — responsive subscription settings reference experience.

The subscription example demonstrates plan limits, billing cadence, owner/member permissions, invoice/payment information, and a consequence-aware cancellation dialog. Its prices and account details are illustrative; it does not connect to a payment provider or modify a real subscription. See [the design notes](../../examples/subscription-settings/README.md).

## Supported UDS subset (conformance)

This renderer is a prototype, not a full UDS interpreter. It fails loudly on unknown component IDs or layout properties, and shows a visible warning when a specification relies on behavior it does not implement.

| Component ID | Supported `layout` properties | Catalog slots rendered | Catalog states | Interactions |
|---|---|---|---|---|
| `uadi.layout.page-shell` | none (layout must be empty) | content region only | none | not implemented |
| `uadi.navigation.primary` | `items[]` with `label` (required) and optional `href`; no other keys | `items` | current destination from prototype page navigation; expanded/collapsed not implemented | not implemented |
| `uadi.feedback.alert` | `variant`: `info` (default), `success`, `warning`, `error` | title/message text via `content_intent`; actions not rendered | variant maps to a `status`/`alert` role | not implemented |
| `uadi.form.field` | `label`, `placeholder`, `required` (boolean), `type`: `text` (default), `email`, `number`, `search`, `tel`, `url` | `label` and `control`; hint/error not rendered | browser focus/disabled states only; no validation-state rendering | not implemented |
| `uadi.data.empty-state` | `title` | title and `content_intent` description; illustration/action not rendered | default | not implemented |

Other UDS semantics:

- **Tokens:** accepted and preserved in the artifact, but not applied. Styling comes from `src/styles.css`.
- **Responsive rules:** `responsive[]` is advisory. Layout responds through CSS media queries and the renderer's own navigation reflow.
- **Accessibility requirements:** `accessibility[]` is advisory. The renderer provides landmarks, labelled controls, focus-visible styles and dialog focus handling, but does not enforce the declared requirements.
- **Interactions:** `interactions[]` is not interpreted. A visible prototype warning is rendered so consequential intent is not silently dropped.

## Checks

Run `npm ci`, `npm run typecheck`, and `npm run build` in this directory. Browser tests cover keyboard interaction, accessibility, responsive behavior, cancellation flow and screenshot comparisons. Install Chromium once with `npx playwright install --with-deps chromium`.

Committed screenshot baselines live in `tests/prototype.spec.ts-snapshots/`. The comparison budget is 2% of pixels (`maxDiffPixelRatio: 0.02`). To accept an intentional visual change, run `npx playwright test --update-snapshots`, inspect the generated images and the diff, then commit the updated baselines. The build emits ES modules and declarations to `dist/`. Generated source remains untrusted and must be built in a constrained environment without production secrets.
