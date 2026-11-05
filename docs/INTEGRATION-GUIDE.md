# Integrating UADI into an existing AI agent
UADI is embedded capability, not a separately hosted agent or required backend. The host agent remains responsible for tool access, authenticated identity, user interaction, and execution policy.
## Portable integration contract
1. Load SKILL.md and relevant workflow instructions into the host's project context.
2. Treat repository artifacts as durable state: context, discovery, analysis, proposal, UDS, feedback, revision history, approval, and published configuration.
3. Validate artifacts with JSON Schemas before passing them between workflow stages.
4. Keep generated source in a constrained workspace. Never expose production secrets or execute generated code with privileged credentials.
5. Obtain owner approval outside model-authored text. Bind approval to the exact proposal ID and version and verify the actor through the host's authenticated identity.
6. Commit each artifact revision; never overwrite approved or historical artifacts.
## Host responsibilities
The host adapter maps generic operations to filesystem, editor, terminal, identity, and confirmation capabilities. It must not change workflow semantics or allow model self-approval.
## Host-specific notes
- Cursor: load the skill and workflows as project rules; use repository files as source of truth.
- Claude Code: expose the skill as project-level instructions and use filesystem/terminal tools.
- Codex: load the same skill and schemas as repository context; use its workspace and review flow.
- Other agents: implement the portable contract. MCP is optional, not a prerequisite.
