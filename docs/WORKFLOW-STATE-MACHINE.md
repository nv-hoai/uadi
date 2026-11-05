# UADI Workflow and State Machine

## Lifecycle
INITIALIZED → DISCOVERY → ANALYSIS → CONCEPT_GENERATION → SPECIFICATION → PROTOTYPE_READY → OWNER_REVIEW.

From OWNER_REVIEW:
- REQUEST_CHANGES → ITERATION → SPECIFICATION
- REJECT_CONCEPT → CONCEPT_GENERATION
- APPROVE → APPROVED → CONFIGURATION_PUBLISHED
- CANCEL → CANCELLED

A completed session may be archived.

## Transition guards
| Transition | Preconditions |
|---|---|
| Initialize → Discovery | Project and scope identified |
| Discovery → Analysis | High-impact gaps resolved or explicitly accepted as assumptions |
| Analysis → Concept generation | Analysis artifact validates |
| Concept generation → Specification | At least one proposal exists; normally 2–3 distinct proposals |
| Specification → Prototype | UDS validates against schema and catalog |
| Prototype → Owner review | Prototype and limitations are recorded |
| Owner review → Iteration | Feedback identifies requested changes |
| Owner review → Approved | Explicit owner approval for exact proposal ID and version |
| Approved → Published | Approved configuration validates |

## Invariants
1. Proposal revisions are immutable; edits create a new version.
2. Approval references an exact proposal ID and version.
3. Agent output is not evidence of owner approval.
4. No configuration is published before valid approval.
5. Feedback does not automatically become a permanent rule.
6. High-impact requirement changes trigger re-analysis.
7. Cancelled or archived sessions are not silently reopened.

Store current state, timestamps, project/feature scope, artifact references, and concise event history in the session record. Chat transcript is not the source of truth.
