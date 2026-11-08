# UX Pattern Library

These patterns describe recurring user problems and useful solution structures. They are not component specifications and should not be copied without checking context.

| Pattern | Use when | Main risk it helps address |
|---|---|---|
| [Settings information architecture](settings-information-architecture.md) | Users manage several related settings or account resources | Dense, poorly grouped settings and hidden high-value information |
| [Permission-aware actions](permission-aware-actions.md) | Capabilities differ by role or ownership | Confusion about who can do what and why |
| [Destructive actions](destructive-actions.md) | An action can remove data, access, money or service | Accidental commitment and unclear consequences |
| [Status, empty states and recovery](status-and-recovery.md) | Users depend on asynchronous or incomplete system data | Uncertainty, dead ends and failed task recovery |
| [Data tables and filtering](data-tables-and-filtering.md) | Users scan, compare, filter or act on multiple records | Poor findability, weak comparison and unsafe bulk actions |
| [Forms and validation](forms-and-validation.md) | Users enter or change structured information | Unnecessary effort, late errors and lost input |
| [Onboarding and activation](onboarding-and-activation.md) | New users need to reach a first meaningful outcome | Setup friction, forced invitations and activity mistaken for value |
| [Metrics and data visualization](metrics-and-data-visualization.md) | Users monitor performance, compare periods or investigate signals | Misleading metrics, unclear freshness and charts disconnected from decisions |

## Reference implementations

Each pattern ends with an implementation example. These runnable prototypes show one contextual adaptation, not a mandatory component:

- [Subscription settings](../../examples/subscription-settings/README.md) — settings information architecture, permission-aware actions, destructive actions and forms.
- [First-run onboarding](../../examples/product-onboarding/README.md) — onboarding, forms and validation.
- [Operations dashboard](../../examples/operations-dashboard/README.md) — data tables, metrics, status and recovery.
- [SSO discovery](../../examples/sso-discovery/README.md) — settings information architecture, permission-aware actions, destructive actions, status and recovery.

The examples use synthetic data and state their limitations. Inspect the decisions and interactions; do not copy the visual answer without checking the current product's context.

## Selecting a pattern

Start with the user's task and the information they need to make progress. Use a pattern only when it addresses a real problem in the current context. Patterns can be combined when a flow crosses concerns—for example, a permission-aware form or a filterable table with destructive bulk actions.

For the reasoning method behind selecting and adapting patterns, see [Flow and States](../modules/flow-and-states.md) and [Content and Consequences](../modules/content-and-consequences.md).
