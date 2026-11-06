# Pilot prompt templates

These are the condition prompts used for the pilot. Every run received the same task brief (the relevant file in `benchmarks/`), followed by the shared instructions and one condition-specific paragraph.

## Shared run instructions

```text
## Run instructions

Your project directory is `<PROJECT>`. Work only inside it. Do not read or modify files outside it. No network access.

Deliver `index.html`, `styles.css`, `app.js` and `analysis.md` at the project root. The interface must be complete and runnable by opening `index.html`. Record only checks you actually run; do not claim checks you did not run.

At the start run `date +%s > .run-start`. Before you finish run `date +%s > .run-end` and write `transcript.md` summarizing what you did, the commands you ran, the checks you performed and any limitations.

Spend at most about 20 minutes on the deliverable. Prioritize a coherent, working experience over extra documents.
```

## Baseline addition

```text
No design skill, methodology or reference implementation is installed. Use your own judgment and the task brief.
```

## UADI addition

```text
The UADI design skill is installed at `.agents/skills/uadi/SKILL.md`. Read it and apply the parts relevant to this task.

In your deliverables, do not name or refer to UADI, the skill or its files; describe the design reasoning on its own terms.
```

The skill was installed with:

```bash
node scripts/install-skill.mjs --agent codex --cwd <project>
```

## Judge prompt

The main panel used [`benchmarks/JUDGE-PROMPT.md`](../../JUDGE-PROMPT.md) verbatim, plus a per-pass instruction file that supplied the seven dimension keys, their weights and the required `result.json` shape. The judge prompt was copied into each pass directory so the pass could not see the repository path or the condition mapping.

Judges were told to read only their own `inputs/` directory: `task.md`, `condition-a/` and `condition-b/`. The packets contained the analysis, implementation, desktop and mobile screenshots, and automated checks. They contained no `mapping.json`, transcript or condition name. Text was sanitized to remove absolute paths, `.agents` paths, `SKILL.md`, `UADI` and `playbook` references.

## Position control

The position control reused the same task brief, judge prompt, rubric and packets, but swapped the two candidate folders in `inputs/`. Each control pass was a fresh subagent context and was not part of the main panel.
