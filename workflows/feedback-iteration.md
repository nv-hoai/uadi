# Workflow: Feedback and Iteration

1. Identify the exact `proposal_id` and `proposal_version` under review.
2. Record the actor and role using the host's authenticated identity where available.
3. Capture each feedback item with category, target, requested action, comment, and priority, following `schemas/design-feedback.schema.json`.
4. Use `REQUEST_CHANGES` for revision requests, `REJECT_CONCEPT` to discard a direction, and `COMMENT` for non-blocking observations.
5. Never edit an existing proposal/specification/prototype revision in place. Create a new version and link it to its parent revision.
6. Re-run schema, accessibility, responsive, and prototype checks appropriate to the changed scope.
7. Preserve feedback history and explain which items were accepted, deferred, or not adopted and why.

Feedback is input to a new design revision; it does not silently become a permanent design-system rule.
