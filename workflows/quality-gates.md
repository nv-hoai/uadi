# Quality gate workflow

1. Resolve the artifact identity, version and canonical content digest.
2. Determine which gates are affected by the artifact and its dependencies.
3. Run independent validators/tests; collect check-level evidence and stable report references.
4. Create one immutable gate result per gate and exact artifact revision.
5. Reject duplicate, missing, stale or mismatched gate results.
6. Require all ten gates to PASS for normal publication. Warnings require explicit policy handling; blockers cannot be waived by an agent.
7. For Gate 9, obtain actor identity and role from the host authentication layer and verify approval against the exact proposal ID/version.
8. Before Gate 10, compare candidate configuration with the last approved baseline and evaluate regression/drift.
9. Publish only after release readiness is established. Preserve all evidence and previous approved revisions.
10. On any artifact change, invalidate affected evidence and rerun dependent gates.

The agent may explain failures and propose fixes. It cannot mark its own output as independently verified or approve itself.
