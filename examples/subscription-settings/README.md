# Subscription settings reference example

A working React reference implementation for the [subscription settings benchmark](../../benchmarks/tasks/subscription-settings.md).

## Open it

From `renderers/react/`:

```bash
npm ci
npm run dev
```

Open `http://127.0.0.1:4173/subscription-settings`.

## Design decisions

- **Plan comprehension first:** current plan, cost, renewal date and member-seat usage are grouped into one summary so owners can answer “what do we have and when will we pay?” without scanning several settings sections.
- **Separate billing cadence from plan selection:** monthly/yearly is a clear, reversible control; prices update immediately and the yearly saving is explicit.
- **Make limits concrete:** show used seats, total seats and remaining capacity rather than only a plan maximum.
- **Respect role boundaries:** members can inspect plan information but do not see owner-only plan, payment or cancellation actions. The role switch is a prototype-only testing control.
- **Protect cancellation without hiding it:** cancellation remains discoverable in a separate section. The confirmation explains the effective date, move to Free, 3-member limit and access implication before the final action.
- **Give feedback without pretending to transact:** payment updates, invoice downloads and plan changes are visibly demo-only. Cancellation simulates a scheduled state and does not call a payment service.
- **Use realistic sample content:** prices, payment method, dates and invoices are illustrative fixture data, clearly labelled as such. Replace them with billing-provider values in a real integration.

## Interaction states

- Toggle monthly/yearly billing and compare plan prices.
- Switch Owner/Member to inspect permissions.
- Select a different plan to see a non-transactional review state.
- Expand payment method update information.
- Open and dismiss cancellation confirmation with Escape, close, backdrop or keep-plan action.
- Confirm cancellation to see the scheduled state.
- Invoice download controls explain that no download integration exists.

## Deliberate limitations

This is a design prototype, not a billing application. It has no authentication, payment provider, API, persistent state, real invoices or actual subscription mutation. The sample renewal date and pricing are not product claims. Production behavior must be sourced from the billing system and verified against the product's cancellation, proration, tax and access policies.
