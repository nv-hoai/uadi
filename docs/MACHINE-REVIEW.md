# Two-reviewer machine review

**Status: required for benchmark evidence in this repository.** It replaces the previous requirement for paid independent human reviewers. It is a machine review, not a human review, and must always be labeled as such.

## Why this protocol exists

UADI is maintained by a solo developer. Paying two independent human reviewers for every study is not realistic. The project still needs a repeatable way to challenge a single model's judgment, preserve evidence and reduce one-pass bias.

The two-reviewer machine panel does that by forcing two separate model sessions to grade the same blinded packets alone, capture visual evidence, lock their scores before seeing each other, then exchange evidence and justify any change. It is stronger than one LLM pass and weaker than independent human review. Report it as screening-grade evidence.

## What it can and cannot support

| Tier | Requirement | What it supports |
|---|---|---|
| Exploratory pilot | 3 tasks × 3 repetitions on one pinned model family | Finding protocol defects and generating hypotheses |
| **Machine-reviewed study** | The pilot minimum plus two independent reviewers per condition under this document | A defensible internal result, with stated machine-review limits |
| Confirmatory machine study | Machine-reviewed study plus two pinned model families | The strongest machine-only result this repository can produce |
| Confirmatory human study | Optional: two independent human reviewers per condition | Claims about human-perceived quality; not required by this repository |

No tier allows a claim of human validation, usability improvement in the field, or statistical significance without the corresponding evidence.

## Roles

- **Coordinator** — prepares identical blinded packets, keeps `mapping.json`, freezes round 1, validates outputs, reveals the mapping. Never scores.
- **Reviewer R1 and Reviewer R2** — separate sessions, same packet, same rubric. They grade alone, capture evidence, then exchange results.
- **Chair** — optional, only when a two-point dimension split survives discussion. The chair reads both positions and the cited evidence and sets the final score.

## Procedure

### 1. Prepare identical blinded packets

For each pair, copy only:

- `task.md`
- `condition-a/` (analysis, implementation, screenshots, automated checks)
- `condition-b/`

Do not include `mapping.json`, transcripts, condition names, absolute workspace paths, or any skill references. Reviewer directories must be separate (`inputs/r1`, `inputs/r2`) so neither can read the other.

Sanitize text evidence: remove condition names, repository paths, `.agents` paths and skill names. Keep Candidate A and Candidate B immutable.

### 2. Grade independently

Each reviewer, in a separate session:

1. Reads the task brief and both packets.
2. Inspects both implementations, both screenshots and both check files.
3. Captures at least **two evidence crops per candidate per pair** with:

   ```bash
   node scripts/crop-evidence.mjs <source.png> <out.png> <WxH+X+Y>
   ```

4. Scores all seven dimensions from 0 to 4 with a one-to-three-sentence rationale that cites a file, line, screenshot or crop.
5. Writes one result JSON per pair. No condition names, no mapping access, no comparison with the other reviewer.

### 3. Freeze round 1

Before either reviewer sees the other:

```bash
node scripts/validate-peer-review.mjs \
  --review <review-dir> \
  --runs benchmarks/runs/<study-id>
```

The validator hashes every round-1 result into `freeze-round1.json`. If a result changes after freezing, validation fails.

### 4. Discuss

Give each reviewer the other's round-1 results and evidence. For every dimension where they differ, the reviewer must either:

- **revise** because the other evidence changes their judgment, or
- **maintain** with specific evidence.

Do not move toward agreement without a cited reason. Reviewers write a discussion JSON per pair with their final integer scores.

### 5. Finalize

- Agreed integer scores are final.
- A one-point split is averaged and flagged.
- A two-point split requires the optional chair.
- Record every split in the published report. Averaging is a decision rule, not consensus.

### 6. Reveal and report

Reveal `mapping.json` only after every discussion file exists and validation passes. Map Candidate A/B to baseline/UADI once, then publish:

- final scores per pair and condition,
- round-1 vs final scores,
- remaining splits and reasons,
- evidence crops,
- position sensitivity: compare deltas when UADI was Candidate A against when it was Candidate B,
- the limitations below.

## Non-negotiable rules

1. Reviewers never see `mapping.json` or the other reviewer before round 1 is frozen.
2. Candidate A always means `condition-a`; Candidate B always means `condition-b`.
3. Both packets contain equivalent evidence types. Missing screenshots or checks are reported, not assumed.
4. Every score has a rationale and every claim cites evidence.
5. Do not reward length, vocabulary, file count or checklist compliance.
6. Visual hierarchy is judged from rendered screenshots, not from source.
7. Do not silently drop a pair, a dimension or a disagreement.
8. The report states that both reviewers are LLM sessions, names the model family, and says whether it matches the builder.

## Reviewer output schema

```json
{
  "reviewer_id": "R1",
  "pair_id": "subscription-settings-r1",
  "blind": true,
  "candidate_a": {
    "scores": {
      "product_understanding": 0,
      "ux_reasoning": 0,
      "design_judgment": 0,
      "visual_hierarchy": 0,
      "interaction_completeness": 0,
      "accessibility_responsiveness": 0,
      "implementation_quality": 0
    },
    "rationale": { "product_understanding": "Cited reason.", "ux_reasoning": "Cited reason.", "design_judgment": "Cited reason.", "visual_hierarchy": "Cited reason.", "interaction_completeness": "Cited reason.", "accessibility_responsiveness": "Cited reason.", "implementation_quality": "Cited reason." },
    "evidence": [
      { "file": "evidence/<pair>/a/plan-summary.png", "caption": "What this crop shows", "dimension": "visual_hierarchy" }
    ],
    "critical_defects": ["..."],
    "strengths": ["..."]
  },
  "candidate_b": { "scores": {}, "rationale": {}, "evidence": [], "critical_defects": [], "strengths": [] },
  "comparison": "Two or three sentences using only Candidate A and Candidate B.",
  "limitations": "What could not be assessed."
}
```

Discussion files add `final_scores`, `responses` and `differences_remaining`.

## Directory layout

```text
<review-dir>/
  inputs/r1/<pair>/{task.md, condition-a/, condition-b/}
  inputs/r2/<pair>/{task.md, condition-a/, condition-b/}
  out/r1/<pair>.json
  out/r1/<pair>.discussion.json
  out/r1/evidence/<pair>/<a|b>/*.png
  out/r2/...
  freeze-round1.json
  discussion-summary.json
```

## Validation and scoring

```bash
node scripts/validate-peer-review.mjs \
  --review <review-dir> \
  --runs benchmarks/runs/<study-id> \
  --write-results <study>/results.json
```

The validator checks reviewer metadata, all seven dimensions, rationale length, evidence existence, freeze integrity, discussion round-1 consistency and split accounting. It writes `discussion-summary.json` and can emit a scorer-compatible `results.json`; replace the `RECORD_ME` study fields before scoring.

Then:

```bash
node scripts/score-benchmark.mjs <study>/results.json
```

The scorer now reports:

- `machine_review_minimum_met` — at least two independent reviewers per condition, human or LLM.
- `human_review_minimum_met` — optional human tier.
- `evidence_tier` — `exploratory-pilot`, `machine-reviewed-pilot`, `confirmatory-machine` or `confirmatory-human`.

## Limitations to publish every time

- Both reviewers are LLM sessions and may share the builder's model family and blind spots.
- Separate sessions are not independent people.
- Blinding is textual; residual stylistic hints may remain.
- Default-state screenshots do not cover dialogs, errors, loading or role-restricted states unless those are captured too.
- Averaging a one-point split is a decision rule, not agreement.
- Machine review is screening-grade; it does not establish human-perceived quality or statistical significance.
