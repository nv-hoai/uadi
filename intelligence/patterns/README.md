# UX Pattern Library

These patterns describe recurring user problems and useful solution structures. They are not component specifications and should not be copied without checking context.

| Pattern | Use when | Main risk it helps address |
|---|---|---|
| [Settings information architecture](settings-information-architecture.md) | Users manage several related settings or account resources | Dense, poorly grouped settings and hidden high-value information |
| [Permission-aware actions](permission-aware-actions.md) | Capabilities differ by role or ownership | Confusion about who can do what and why |
| [Destructive actions](destructive-actions.md) | An action can remove data, access, money or service | Accidental commitment and unclear consequences |
| [Status, empty states and recovery](status-and-recovery.md) | Users depend on asynchronous or incomplete system data | Uncertainty, dead ends and failed task recovery |
| [Data tables and filtering](data-tables-and-filtering.md) | Users scan, compare, filter or act on multiple records | Poor findability, weak comparison and unsafe bulk actions |
| [Forms and validation](forms-and-validation.md) | Users enter or change structured information | Unnecessary effort, late errors and lost input |\n| [Onboarding and activation](onboarding-and-activation.md) | New users need to reach a first meaningful outcome | Setup friction, forced invitations and activity mistaken for value |\n| [Metrics and data visualization](metrics-and-data-visualization.md) | Users monitor performance, compare periods or investigate signals | Misleading metrics, unclear freshness and charts disconnected from decisions |

## Selecting a pattern

Start with the user's task and the information they need to make progress. Use a pattern only when it addresses a real problem in the current context. Patterns can be combined when a flow crosses concerns—for example, a permission-aware form or a filterable table with destructive bulk actions.

For the reasoning method behind selecting and adapting patterns, see [UX Reasoning Playbook](../UX-REASONING-PLAYBOOK.md).
