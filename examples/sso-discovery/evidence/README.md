# Evidence packet: Kestrel SSO enforcement

This packet is a synthetic teaching fixture. Kestrel is not a real product, the source files are an excerpt rather than a runnable application, and the support themes are constructed for this example. Nothing here is customer research, production telemetry or a real security policy.

The packet is deliberately mixed. It contains:

| File | Provenance | What it represents |
|---|---|---|
| `product-brief.md` | Supplied | The product team's brief and the customer request |
| `help-center-sso.md` | External | Published documentation, last reviewed 2025-08 |
| `support-themes.md` | External | Themes synthesized from a small support sample |
| `app/` | Observed | A source excerpt showing what the product currently does |

Read the packet in that order, then inspect `app/`. The scenario depends on a real conflict: the documentation and support evidence describe Admin access, while the current route, permission table and test enforce Owner-only access.

Do not treat `app/tests/permissions.checks.ts` as the desired policy. It describes current behavior and may encode the bug.

Next: [product brief](product-brief.md).
