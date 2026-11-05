# Workflow: Approve and Publish
## Approval
1. Present the exact proposal ID/version, UDS revision, prototype revision, and known limitations.
2. Obtain an explicit owner decision through the host environment's trusted interaction.
3. Verify the actor is authorized as project OWNER outside model-generated text.
4. Bind approval to the exact proposal ID and version. Any changed proposal requires a new approval.
5. Store an immutable approval record matching schemas/approval.schema.json, including a trusted authorization reference.
An agent message saying "approved", a model-generated actor field, or an approval copied from another proposal is not sufficient evidence.
## Publish
1. Validate the approval record and confirm it references the exact proposal version.
2. Create a new configuration revision; never overwrite an approved revision.
3. Resolve inheritance in this order: Feature Override > Project Configuration > UADI Defaults.
4. NON_OVERRIDABLE accessibility, security, and brand constraints always take precedence.
5. Validate the resolved configuration and record source references.
6. Publish only after all checks pass. Rollback creates a new revision referencing a previous approved configuration; never rewrite history.
