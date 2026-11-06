# Kestrel product brief — workspace security

## Product

Kestrel is a shared inbox for B2B customer support teams. Support agents work conversations in shared inboxes; Admins configure the workspace; Owners are accountable for the account.

## Plans

| Plan | Agent limit | SSO |
|---|---|---|
| Starter | 5 | Not included |
| Growth | 25 | Not included |
| Scale | Unlimited | Included |

Plan changes are handled by the account team. There is no in-app purchase flow in this release.

## Roles

- **Owner** — controls billing, workspace deletion and security enforcement.
- **Admin** — manages members, inbox settings and workspace configuration.
- **Agent** — works conversations in assigned inboxes.

A workspace can have more than one Owner. Every workspace must keep at least one Owner.

## Requested change

A Scale customer asked to require SSO for every member of their workspace. Today they can connect an identity provider, but they cannot require members to use it.

## Why this matters

Enterprise buyers ask for enforceable SSO during security review. Password-based access is also a recurring support cost when employees move between teams.

## Scope for this release

- Enforce SSO for all members of a workspace.
- Keep enforcement reversible by an authorised role.
- Explain the consequence before enforcement is enabled.
- Use the existing Kestrel settings surface.

## Explicit non-goals

- SCIM or automatic user provisioning.
- Multiple identity providers in one workspace.
- Per-group or per-inbox enforcement.
- Changing plan entitlements or pricing.
- A new audit-log product.

## Open policy questions

The brief does not settle who may turn enforcement on or off, what happens to existing sessions, or how an Owner recovers access if the identity provider is unavailable. Those gaps must be resolved with the product owner rather than inferred from the current implementation.
