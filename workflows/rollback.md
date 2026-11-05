# Workflow: Roll back a published design configuration
1. Identify the affected project/feature scope and current published config ID/version.
2. Select a previously approved configuration revision for the same scope. Never roll back to an unapproved draft.
3. Verify its source proposal/version and approval record through the host's authenticated identity provider.
4. Publish a new configuration revision that references the prior approved content and sets supersedes to the current config ID. Do not rewrite or delete history.
5. Re-run schema and governance validation, then require owner confirmation for the rollback publication.
6. Record reason, actor, timestamp, affected scope, and validation result. Keep the superseded configuration available for audit.
