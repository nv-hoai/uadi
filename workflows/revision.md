# Workflow: Immutable revisions
1. Resolve feedback to an exact proposal ID and version.
2. Reject stale targets; feedback must apply to the latest revision or be explicitly rebased by the owner.
3. Classify feedback and map each item to a UDS page, section, token, interaction, or rule.
4. Produce a new artifact snapshot with incremented version, parent revision ID, feedback ID, timestamp, and SHA-256 content digest.
5. Never mutate the parent snapshot. Preserve accepted, deferred, and rejected feedback decisions.
6. Validate the new artifact and prototype before owner review.
7. Keep approval attached to the exact revision; any later edit invalidates approval for the new revision.
