# Worked example: SSO discovery and context synthesis

This example starts where the other worked examples do not: with an ambiguous, brownfield evidence packet. A customer asks Kestrel to require SSO, but the documentation, the source code and the support evidence disagree about who may manage it. The example shows the discovery work that happens before a design decision, including the point where the agent must stop and ask the owner.

Kestrel is a synthetic product. The evidence packet, support themes and owner decisions are constructed for teaching, not customer research or a real security policy.

## Run the prototype

From the repository root:

~~~bash
python3 -m http.server 8000
~~~

Open `http://localhost:8000/examples/sso-discovery/app/`.

The prototype is plain HTML, CSS and JavaScript: no dependencies, API, account or build step. The "Prototype controls" panel switches role, plan and data state; it makes no network request and persists nothing.

## 1. The evidence packet

The packet in [`evidence/`](evidence/README.md) deliberately mixes provenance:

| Source | Provenance | What it contributes |
|---|---|---|
| [`product-brief.md`](evidence/product-brief.md) | Supplied | Plans, roles, the customer request and the non-goals |
| [`help-center-sso.md`](evidence/help-center-sso.md) | External, last reviewed 2025-08 | Published instructions that say Admins can configure and require SSO |
| [`support-themes.md`](evidence/support-themes.md) | External, 14 tickets, not representative | Admins expect access; customers fear lockout and misunderstand sessions |
| [`app/`](evidence/app/README.md) | Observed source excerpt | The current route guard, permission matrix, plan entitlement, placeholder panel and tests |

The source excerpt is intentionally small and not runnable. Its absences matter: there is no enforcement flag, no session-revocation hook, no recovery flow and no billing API. The agent must not invent those capabilities just because the feature needs them.

## 2. Discovery: separate the conflict from the policy

The first discovery artifact is [`artifacts/01-blocked/discovery-result.json`](artifacts/01-blocked/discovery-result.json). It records facts, assumptions and unknowns with sources instead of turning the current code into the intended rule.

The material findings:

- SSO is a Scale entitlement; Starter and Growth do not include it.
- The security route and navigation are Owner-only, and a test enforces that behavior.
- The help center says Admins can connect a provider and require SSO.
- The help center tells customers to contact support if the provider is unavailable.
- The current security panel is a disabled "Coming soon" placeholder.
- The data model has no enforcement state or session-revocation hook.
- Support themes show Admins hitting the permission wall and customers fearing a workspace-wide lockout.

The implementation and the documentation conflict. The test describes what the code does today, not what the product should do. Discovery therefore records the conflict and does not choose a side.

Two questions are required before design:

| ID | Question | Why it blocks |
|---|---|---|
| **Q1** | Who may turn enforcement on and off: Owners only, or Owners and Admins? | Changes the route guard, Admin controls, audit trail and recovery path |
| **Q2** | What recovery path exists if the identity provider is unavailable or misconfigured? | A wrong answer can lock every member out |

The artifact also records three lower-impact questions (session timing, metadata visibility and downgrade behavior) but marks them non-blocking. Only Q1 and Q2 stop the work; the example does not turn every uncertainty into a questionnaire.

The artifact is `BLOCKED` with those gaps named. That is the honest state, not a failure of the process.

## 3. Resolve the blocking decisions

The resolved artifact is [`artifacts/02-resolved/discovery-result.json`](artifacts/02-resolved/discovery-result.json). It adds the simulated owner decisions as confirmed facts:

- Admins may connect and manage the identity provider; only Owners may enable or disable enforcement.
- Owners can generate a one-time break-glass link; support cannot bypass SSO.
- Enforcement applies at the next sign-in; existing sessions expire within 24 hours.

Readiness is `READY_WITH_ASSUMPTIONS`, not `READY`. A material assumption remains: the account team must turn enforcement off before a workspace leaves Scale. That rule is not defined in the evidence, so the example keeps it visible instead of silently deciding it.

## 4. Synthesize the context

[`artifacts/02-resolved/project-context.json`](artifacts/02-resolved/project-context.json) turns the resolved discovery into a compact working model:

- **Users:** Owner, Admin and Agent, each with needs that change the screen.
- **Business goals:** pass enterprise security review, reduce password support, make enforcement safe to operate.
- **Constraints:** Scale-only entitlement, one connection per workspace, no SCIM or multi-IdP, no in-app purchase flow, React/TypeScript and the existing settings components.
- **Design preferences:** the existing calm settings pattern, low density, explicit consequence copy.

It excludes what the evidence does not support: no revenue model, no driver productivity, no audit-log product, no forecast. The context is a feature context (`scope: "FEATURE"`), not a claim about the whole product.

## 5. Design brief

The full reasoning is in [`artifacts/02-resolved/design-brief.md`](artifacts/02-resolved/design-brief.md). The [UX Reasoning Playbook](../../intelligence/UX-REASONING-PLAYBOOK.md) uses the enforcement flow as a compact trace of task-flow, edge-case and content reasoning, and the [Design Decisions Playbook](../../intelligence/DESIGN-DECISIONS-PLAYBOOK.md) reuses the permission-model comparison. The decisions that matter most:

- **Two-person control.** Admins configure the connection; Owners enforce it. This resolves the docs/code conflict without pretending the old test was policy.
- **Configuration and enforcement are separate cards.** Connecting a provider is routine; changing how every member signs in is not.
- **Enforcement is guarded.** "Require SSO" opens a dialog that states the scope, timing and session consequence, and requires the Owner to download a recovery link and confirm it was saved.
- **Recovery exists before the failure.** The break-glass link is Owner-only; support cannot bypass SSO.
- **The plan gate explains, it does not sell.** Starter and Growth see why SSO is unavailable and that the account team handles plan changes.
- **State and permission are written, not colour-only.** Not connected, Connected, Not required, Required, Loading, Unavailable and No access are explicit.

## 6. Implementation and interaction coverage

Open [`app/index.html`](app/index.html), [`app/app.js`](app/app.js) and [`app/styles.css`](app/styles.css) to inspect the implementation.

| Interaction | Implemented behavior |
|---|---|
| Role switch | Owner, Admin and Agent views; names and permissions update |
| Plan switch | Scale shows the full flow; Starter and Growth show the plan explanation with no purchase CTA |
| Scenario switch | Connected/not required, no connection, required, loading and load error |
| Connect provider | URL validation (required, valid, `https://`); provider and domain update from the URL |
| Manage connection | Prefilled metadata URL; blocked while enforcement is on |
| Require SSO | Dialog states every-member scope, next sign-in, 24-hour session expiry; download + confirmation required |
| Recovery link | Download is simulated; the enforced state can regenerate it |
| Turn off enforcement | Separate confirmation explains that password sign-in returns and existing SSO sessions are not revoked |
| Admin view | Connection actions available; enforcement callout explains the Owner boundary |
| Agent view | Permission-denied state with no security actions |
| Loading | Skeleton cards with `aria-busy`; the error retry path transitions through loading to ready |
| Load error | No stale figures; retry returns through loading to ready |
| Keyboard | Skip link, native selects and buttons, focus-trapped dialogs, Escape returns focus, focus moves to the enforcement heading after an action |

The prototype does **not** implement authentication, a real identity provider, persistence, session revocation, audit logging or plan changes.

## 7. Validation performed

Validated on 2026-11-06 with Playwright 1.64.1 (Chromium revision 1248) against a local static server.

| Check | Result |
|---|---|
| Discovery and context schemas | `npm run validate -- examples/sso-discovery/artifacts/01-blocked/discovery-result.json examples/sso-discovery/artifacts/02-resolved/discovery-result.json examples/sso-discovery/artifacts/02-resolved/project-context.json` — all pass |
| Core tests | `npm test` — 49 passed |
| Renderer type-check and build | `npm run typecheck` and `npm run build` — pass |
| axe-core WCAG 2.1 A/AA | 0 violations on the default Owner view, Admin view, Agent view, plan gate, enforced state, enforce dialog and mobile disable dialog |
| Document horizontal overflow | 0 at 1280, 768 and 375 CSS px; the mobile dialog's scroll width also equals its client width |
| Browser console / page errors | None on the exercised paths |
| Connection validation | Empty URL and `http://` URL show actionable errors and return focus to the URL field |
| Enforcement flow | Download is required before the confirm button enables; checkbox + confirm works by keyboard; live region announces success |
| Focus behavior | Skip link focuses `main`; Tab stays inside the open dialog; Escape returns focus to the trigger or the enforcement heading |
| Demo controls | Role, plan and scenario selects respond to arrow keys and update the page |
| Admin/Agent boundaries | Admin sees the Owner-only callout and no enforcement action; Agent sees the permission-denied state |

Only Chromium was tested. No real identity provider, authentication session, screen reader, timezone or high-volume workspace was exercised.

## 8. Limitations and misleading interpretations

- **Synthetic evidence.** The product, support themes and owner decisions are constructed. Do not cite them as customer research.
- **The owner decisions are a teaching device.** In a real engagement, the owner would answer Q1 and Q2; this example simulates those answers to show the resolved path.
- **No real recovery.** The break-glass link is a design element. A production implementation must define generation, storage, expiry, use limits and audit behavior.
- **Downgrade behavior is unresolved.** The example assumes the account team disables enforcement before a plan change; billing must confirm the real rule.
- **Audit is unresolved.** The screen shows who configured the connection and when, but does not design an audit log.
- **No IdP integration.** Provider names are inferred from the metadata URL; no SAML exchange or session revocation occurs.
- **The old test is evidence, not policy.** `permissions.checks.ts` describes Owner-only behavior; the design changes that behavior only because the owner decision says so.
- **Mobile navigation is simplified.** The settings nav is hidden below 860px; a production settings area needs a real mobile navigation pattern.
- **Accessibility coverage is partial.** The design targets WCAG 2.2 AA, but automated checks covered WCAG 2.1 A/AA in Chromium; 2.2-specific criteria and a screen-reader review were not exercised.

## What this example demonstrates

The evidence table separates supplied, external and observed material. Discovery names a real conflict and stops at two high-impact questions instead of guessing. The resolved artifact records owner decisions and keeps a remaining assumption visible. The context synthesis limits itself to what changes the design. The brief traces each decision to evidence and trade-offs. The prototype makes the permission, state and recovery decisions inspectable, and validation states exactly what was and was not checked.
