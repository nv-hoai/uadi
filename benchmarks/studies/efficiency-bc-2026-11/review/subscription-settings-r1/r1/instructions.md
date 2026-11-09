# Benchmark judge prompt (blinded)

You are an independent reviewer evaluating two product-design deliverables against the supplied task brief and rubric.

## Immutable candidate labels

- **Candidate A** means only the files in the attached `blind/condition-a` evidence packet.
- **Candidate B** means only the files in the attached `blind/condition-b` evidence packet.
- Keep these labels unchanged in every note, score, quote and conclusion. Never rename them X/Y, switch their identities, or infer which one used UADI.
- The coordinator has intentionally withheld the condition mapping. Do not guess or speculate about it.

## Review rules

1. Read the task brief and both complete evidence packets before scoring.
2. Confirm that the evidence types are comparable. Identify missing screenshots, test output or implementation artifacts rather than assuming they exist.
3. Score each candidate independently on all seven rubric dimensions from 0 to 4. Cite concrete file paths, screenshots or test evidence for each score.
4. The visual-hierarchy dimension requires rendered screenshots or a runnable preview at equivalent viewport sizes. If either candidate lacks equivalent rendered evidence, do not assign a numerical score for that dimension. Flag the pair as not scoreable under the current seven-dimension scorer and ask the coordinator to obtain equivalent evidence before scoring; do not infer visual quality from prose or design tokens.
5. Do not reward longer explanations, UADI terminology, checklist compliance or artifact volume. Judge the delivered product and its evidence.
6. Do not infer unsupported product rules, backend behavior, user research or test results.
7. Do not read or request the coordinator-only `mapping.json`. Do not see other judge passes or discuss scores with other reviewers.
8. Return one result for Candidate A and one for Candidate B, always using those exact labels.

## Required output

For each candidate provide:
- Seven dimension scores (0–4) with concise evidence citations.
- A weighted score only if all seven dimensions are assessable.
- Critical defects, missing evidence and meaningful strengths.
- A short comparison that refers only to Candidate A and Candidate B.

Finish with a limitations note. This is one judge pass, not a statistical test and not proof of causation.

---

## Pair

Pair id: `subscription-settings-r1`
Task: `subscription-settings`

Read `inputs/task.md`, then inspect `inputs/condition-a/project`, `inputs/condition-a/evidence`, `inputs/condition-b/project` and `inputs/condition-b/evidence`. View the screenshots directly. Evidence includes `capture-report.json` (which states were actually activated) and `quality-gates.json` (deterministic checks).

The exact file list is in `FILES.txt` at the pass root. Cite only paths from that list. If a screenshot or state is not in the list, say it is missing; do not invent a filename or a state image.

Write `result.json` in this pass root (not inside `inputs/`) with exactly:

{
  "reviewer_id": "R1",
  "pair_id": "subscription-settings-r1",
  "candidate_a": {
    "scores": {"product_understanding":0,"ux_reasoning":0,"design_judgment":0,"visual_hierarchy":0,"interaction_completeness":0,"accessibility_responsiveness":0,"implementation_quality":0},
    "rationale": {"product_understanding":"citation","ux_reasoning":"citation","design_judgment":"citation","visual_hierarchy":"citation","interaction_completeness":"citation","accessibility_responsiveness":"citation","implementation_quality":"citation"},
    "critical_defects": [],
    "strengths": []
  },
  "candidate_b": { "scores": {}, "rationale": {}, "critical_defects": [], "strengths": [] },
  "verdict": "short comparison using only Candidate A and Candidate B",
  "limitations": "one note"
}

Score all seven dimensions unless the rendered evidence is not comparable; if it is not, say so explicitly instead of inventing a score.
