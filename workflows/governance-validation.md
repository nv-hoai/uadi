# Workflow: Governance validation
1. Validate every artifact against its versioned JSON Schema.
2. Verify revision hashes and parent linkage before accepting an artifact into the current workflow.
3. Confirm approval records reference the exact proposal ID and version being published.
4. Require the host to verify actor identity and authorization; a model-authored actor claim is never sufficient.
5. Reject stale approvals after any proposal/specification revision.
6. Resolve configuration with Feature > Project > UADI Defaults precedence while enforcing NON_OVERRIDABLE defaults.
7. Validate component IDs against the catalog and run prototype contract, type, build, accessibility, and responsive checks available in the host sandbox.
8. Record findings, tool versions, source revision, and timestamp. Do not claim checks that were not run.
