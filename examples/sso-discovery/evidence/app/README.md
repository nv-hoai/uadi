# Kestrel web app — source excerpt

This is a small excerpt from the Kestrel settings area, not a runnable application. It exists so the example can show discovery from observed code rather than from a summary of code.

## Stack

- React 18 and TypeScript
- React Router for settings routes
- Vitest for unit tests
- An internal Kestrel settings component library

## What is included

| File | Why it matters |
|---|---|
| `src/auth/permissions.ts` | The current role matrix |
| `src/billing/plans.ts` | Plan entitlements for SSO |
| `src/auth/sso.ts` | The shape of an identity-provider connection |
| `src/routes/settings.tsx` | Route guards and settings navigation |
| `src/settings/security-panel.tsx` | The current placeholder UI |
| `tests/permissions.checks.ts` | Tests that describe current access behavior |

## What is missing

The excerpt does not include authentication middleware, the identity-provider integration, session storage, audit logging or billing APIs. Those absences are evidence too: do not assume they exist just because the feature needs them.

`tests/permissions.checks.ts` records what the code does today. It is not a statement of the intended permission policy.
