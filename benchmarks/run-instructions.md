# Run instructions

Canonical run instructions for benchmark builds. The prepared prompt for each
condition is composed as: task brief (`benchmarks/tasks/<task_id>.md`), then these
Shared run instructions, then one condition-specific paragraph. The composed prompt is
hashed in `mapping.json` so a later reader can verify byte-identical prompts.

## Shared run instructions

Your project directory is `<PROJECT>`. Work only inside it. Do not read or modify files outside it. No network access.

Deliver `index.html`, `styles.css`, `app.js` and `analysis.md` at the project root. The interface must be complete and runnable by opening `index.html`. Record only checks you actually run; do not claim checks you did not run.

At the start run `date +%s > .run-start`. Before you finish run `date +%s > .run-end` and write `transcript.md` summarizing what you did, the commands you ran, the checks you performed and any limitations.

Spend at most about 20 minutes on the deliverable. Prioritize a coherent, working experience over extra documents.

## Baseline addition

No design skill, methodology or reference implementation is installed. Use your own judgment and the task brief.

## UADI addition

The UADI design skill is installed at `.agents/skills/uadi/SKILL.md`. Read it and apply the parts relevant to this task.

In your deliverables, do not name or refer to UADI, the skill or its files; describe the design reasoning on its own terms.
