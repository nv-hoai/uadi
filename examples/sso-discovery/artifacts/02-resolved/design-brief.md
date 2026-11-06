# Design brief — SSO enforcement

This brief turns the [resolved discovery](../02-resolved/discovery-result.json) and [project context](../02-resolved/project-context.json) into interface decisions. It is a design proposal for a synthetic product, not a production security policy.

## The conflict that shaped the work

The help center says Admins can connect an identity provider and require SSO. The code restricts the security route to Owners, and a test enforces that restriction. Support tickets show Admins hitting the wall and customers fearing lockout.

A second conflict concerns recovery: the help center points customers to support if the provider is unavailable, while the owner chose an Owner-only break-glass link and no support bypass.

Discovery could not resolve the permission question from the repository alone. It recorded a **BLOCKED** result and asked two high-impact questions. The simulated owner then chose a two-person model:

- Admins connect and manage the identity provider.
- Owners enable and disable enforcement.
- Owners can generate a one-time break-glass link; support cannot bypass SSO.
- Enforcement applies at the next sign-in, and existing sessions expire within 24 hours.

The design below follows those decisions. It does not silently treat the old test as policy.

## Decisions

### 1. Separate configuration from enforcement

**Decision:** The page has two cards: **Identity provider** and **SSO enforcement**. Admins can use the connection card; only Owners see the enforcement action.

**Why:** Configuration is routine and reversible. Enforcement changes how every member signs in. Combining them into one "Enable SSO" switch hides that difference.

**Trade-off:** Admins need an Owner for the final step. The copy explains why instead of leaving a dead control.

**Alternative rejected:** Owner-only for everything. It matches the current code but contradicts the published help center and the support evidence.

**Provider detail:** the default card shows the provider name, domain, who configured it and when. The raw metadata URL appears only in the management dialog, so the page does not expose implementation detail at rest.

### 2. Make enforcement a deliberate, recoverable action

**Decision:** "Require SSO" opens a confirmation dialog that states:

- every member will sign in through the provider;
- enforcement starts at the next sign-in;
- existing sessions expire within 24 hours;
- a recovery link must be saved before continuing.

The confirm action stays disabled until the link is downloaded and an explicit checkbox confirms it was saved.

**Why:** A misconfigured provider can lock every member out. The confirmation is the last safe moment to prepare recovery.

**Trade-off:** Extra friction on a security action. That friction is proportionate to the consequence.

**Alternative rejected:** A plain toggle. It is faster but makes an irreversible-feeling action look routine.

### 3. Prepare recovery before enforcement, not after

**Decision:** The dialog offers **Download recovery link** with the copy "Only Owners can use it if your identity provider is unavailable." The link can be regenerated later from the enforced state.

**Why:** Recovery must exist before the failure, and support should not become a bypass channel.

**Trade-off:** The Owner must store the link safely. The dialog cannot verify that.

**Alternatives rejected:** Support-assisted bypass (expands support power and weakens the security promise); no bypass (turns a provider outage into a total lockout).

### 4. Explain the plan gate; do not sell inside security settings

**Decision:** On Starter and Growth, the page explains that SSO is a Scale capability and that the account team handles plan changes. There is no upgrade button in the security surface.

**Why:** Security settings are a trust context. A purchase prompt here makes the capability feel like a trap.

**Trade-off:** Less immediate upsell. The account team remains the path to a plan change, matching the brief.

### 5. Label every state and permission explicitly

**Decision:** Status is written, not only coloured: **Not connected**, **Connected, not required**, **Required for all members**, **Loading**, **Unavailable** and **No access**. Admins see a callout explaining why enforcement is Owner-only. Agents see a permission-denied state.

**Why:** Colour alone fails in greyscale and for some visual impairments. Hiding a control without an explanation looks like a bug.

### 6. Block connection replacement while enforcement is on

**Decision:** When enforcement is on, **Manage connection** becomes a note: "Turn off enforcement before replacing the connection." The prototype does not allow the replacement.

**Why:** The session behavior during a provider swap is unknown. A safe default is to require an explicit enforcement-off step.

**Trade-off:** Provider migration takes an extra step. Billing and identity teams should revisit this once session behavior is verified.

## Information architecture

```
Settings
└── Security
    ├── Page header: Security + plan badge
    ├── Identity provider
    │   ├── Status and provider details
    │   ├── Manage connection (Owner, Admin)
    │   └── Test-sign-in reminder
    └── SSO enforcement
        ├── Status and consequence copy
        ├── Require SSO (Owner, when connected)
        ├── Turn off enforcement (Owner, when required)
        └── Recovery link (Owner, when required)
```

A workspace on Starter or Growth sees the plan explanation instead of the connection and enforcement cards. An Agent sees the permission-denied state.

## Permissions

| Action | Owner | Admin | Agent |
|---|---|---|---|
| Open Settings → Security | Yes | Yes | No |
| View provider details | Yes | Yes | No |
| Connect or replace the provider | Yes | Yes | No |
| Require SSO | Yes | No | No |
| Turn off enforcement | Yes | No | No |
| Generate a recovery link | Yes | No | No |

## States and copy

| State | What the page shows | Primary action |
|---|---|---|
| Loading | Skeleton cards with `aria-busy="true"` | None |
| Load error | "We couldn't load security settings." | Try again |
| Plan does not include SSO | "SSO is available on Scale" and "Your workspace is on the Growth plan. Ask your account team about changing plans." | None |
| No provider | "Not connected" and "Connect an identity provider before you can require SSO." | Connect identity provider |
| Connected, not required | "Connected" and "Members can still sign in with a password." | Require SSO (Owner) |
| Required | "Required for all members" and "Existing sessions expire within 24 hours." | Turn off enforcement / Download recovery link (Owner) |
| Admin viewing enforcement | "Only Owners can require SSO. You can manage the identity provider connection." | Manage connection |
| Admin viewing required | "Only Owners can turn off enforcement. Ask a workspace Owner if SSO should no longer be required." | No edit action; the connection card explains that enforcement must be turned off first |
| Agent | "You don't have access to security settings." | None |
| Enforcement success | Live announcement: "SSO is now required for all members." | None |
| Enforcement off | Live announcement: "SSO is no longer required. Members can sign in with a password." | None |

## Edge cases and rules

- **No provider connected:** enforcement is unavailable; the page explains the prerequisite.
- **Provider unavailable:** the sign-in failure is outside this screen; the recovery link is the documented path.
- **Admin tries to enforce:** no enforcement control is shown; the callout names the role boundary.
- **Owner turns enforcement off:** a confirmation explains that password sign-in returns; existing SSO sessions are not revoked by this action.
- **Plan downgrade while enforced:** unresolved product policy. The brief assumes the account team turns enforcement off before the downgrade; billing must confirm.
- **Last Owner:** out of scope here, but the recovery link is useless if no Owner can sign in. A real release needs an account-recovery policy.
- **Audit event:** unknown. The page shows who configured the connection and when; a full audit log is a separate decision.

## Alternatives considered

| Alternative | Why it was not chosen |
|---|---|
| One "Enable SSO" toggle | Hides the difference between connecting a provider and changing every member's sign-in path |
| Admins can enforce | Faster for Admins, but increases the chance of a workspace-wide lockout and conflicts with Owner accountability |
| Owner-only for all actions | Matches today's code, but contradicts the help center and the support evidence without a product decision |
| Support bypass | Creates a second, weaker authentication path and weakens the enterprise promise |
| Immediate session revocation | Stricter, but interrupts active support shifts; the owner chose a 24-hour expiry |
| Upgrade CTA inside security | Turns a trust surface into a sales surface and conflicts with the account-team process |

## Validation plan

- Validate both discovery artifacts and the project context against their schemas.
- Render the prototype at 1280, 768 and 375 CSS px.
- Run axe WCAG 2.1 A/AA checks on the main states and dialogs.
- Check keyboard flow: skip link, role/plan/scenario controls, dialogs, Escape and focus return.
- Check that no state overflows horizontally or logs console errors.

Results are recorded in the example [README](../../README.md).
