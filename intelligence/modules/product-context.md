# Product Context

**Load when:** users, domain rules, roles, constraints or success criteria are unclear.

## Decision rules

1. Inspect before asking: README, product docs, routes, domain types, permissions, tests, existing `.uadi` artifacts and current screens.
2. Build a compact model: **user → job → trigger → success → constraints**. Note the current workaround and what would make the user abandon the task.
3. Map roles, objects and rules that change what the user sees or can do: ownership, permissions, entitlements, object states, money, retention and external dependencies.
4. Separate **supplied facts, observations, inferences, assumptions and unknowns**. Never promote an inference to a fact.
5. Ask only questions whose answers could materially change the design. Otherwise state a proportionate assumption and proceed.
6. Record a high-impact unknown as a blocking question when guessing would create a false promise, unsafe action or invalid design.

## Failure modes

- Inventing personas, research, analytics, policy or backend behavior.
- Designing for a request ("add a dashboard") instead of the user's task.
- Treating a role label as a permission model without checking the rule.
- Asking a long discovery questionnaire when two questions would resolve the risk.

## Validation

Can you state the primary user, their job, the trigger, the successful outcome, the constraints and the top unknown without inventing anything? If not, inspect more or ask one decision-changing question.

**Source:** distilled from `intelligence/PRODUCT-UNDERSTANDING-PLAYBOOK.md`.
