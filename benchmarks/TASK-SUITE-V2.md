# Task Suite v2 — Diverse Coverage Beyond SaaS Admin

**Status: proposal, not yet a preregistered study.** Suite v2 exists because the
confirmatory suite (subscription settings, product onboarding, operations dashboard)
measures one product class: B2B SaaS administration. It is the right suite for
testing billing, onboarding, and ops density, but a positive result there does not
generalize to consumer, commerce, creator, health, or mobile-utility products.
Suite v2 adds those coverage gaps without breaking the existing study design.

## 1. What Suite v2 is

- **7 new public-candidate tasks** (all `Task version: 1.0.0`, canonical seven
  sections, demoable in one responsive HTML page, 6 capturable states, deterministic
  gates meaningful). Together with the existing 6 tasks (3 public + 3 held-out), the
  repository covers 13 tasks.
- **Archetype mapping is unchanged.** The study validator (`scripts/validate-study-design.mjs`)
  currently accepts only `settings`, `onboarding`, and `dashboard`. Suite v2 maps each
  new task to the nearest existing archetype so a study design can reference it today.
  A true archetype expansion (transactional, creation, advisory, mobile-utility) is
  proposed in §5 as a future, separate change; it requires validator, template, and
  test updates and is not done here.
- **Suite v2 does not replace the existing suite.** Studies keep referencing their
  declared tasks by `task_id` + `task_version`. A study that adopts Suite v2 tasks
  must preregister them in its own `study-design.json` and freeze them like any other
  task.

## 2. Coverage matrix

| Task | Archetype | Domain / platform | Primary design problem | Main risk |
|---|---|---|---|---|
| `marketing-landing-claim` | onboarding | Consumer marketing web | Persuasion under claim risk | Fabricated proof, dark patterns, medical claim |
| `streaming-family-plan` | settings | Consumer streaming | Family settings, profile privacy | Hidden cancel, child safety, billing misunderstanding |
| `creative-first-prompt` | onboarding | Creator AI tool | First creation with credits | Fake quality claim, credit surprise |
| `pharmacy-first-check-in` | onboarding | Health / civic web | Cautious first visit | Implied diagnosis, over-collection |
| `merchant-batch-settlement` | dashboard | Commerce fintech | Reconciliation and fee transparency | Forecast/guarantee, fee opacity, stale data |
| `mobile-queue-status` | dashboard | Mobile utility (clinic) | Glanceable status, low literacy, offline | Exact-wait promise, stale trust, color-only status |
| `workspace-handover` | settings | Collaboration B2B | Deliberate ownership transfer | Silent takeover, lockout, lingering billing access |

Existing suite anchors for comparison: `subscription-settings` (B2B settings),
`product-onboarding` (B2B activation), `operations-dashboard` (B2B ops scan),
`held-out-billing-recovery` (recovery), `held-out-activation-recovery` (return),
`held-out-capacity-investigation` (investigation dashboard).

## 3. Sampling plan: diversity vs replication

The confirmatory minimum is 18 pairs (2 families × 3 tasks × 3 repetitions).
Repetitions exist to shrink the paired 95% interval; diversity exists to support
generalization. Suite v2 studies should choose explicitly:

- **Minimal diverse study:** 7 tasks × 2 families × 2 repetitions = 28 pairs, but the
  current validator requires `design.repetitions >= 3`. A 2-rep study is therefore
  **exploratory**, not confirmatory, until the validator is changed with its own issue
  and tests. Do not report it as confirmatory.
- **Confirmatory diverse study:** 7 tasks × 2 families × 3 repetitions = 42 pairs.
  At the confirmatory-study SD (≈19.5 points, half-width ≈±9.5 at n=18), adding tasks
  also adds task-level variance. A 42-pair study still cannot support a 4-point
  superiority claim without either more pairs or lower judge noise. Preregister the
  larger MDE or the judge-anchoring (§4) and report per-task and per-family intervals.
- **Stratified subset:** pick 4–5 tasks that span the matrix (one per archetype
  minimum) and keep 3 repetitions (24–30 pairs). This is the recommended next study:
  same power as the 18-pair design, four of the seven design problems covered.

Regardless of size, a study must keep the paired rule: same builder model inside a pair,
balanced candidate A/B and baseline-first/UADI-first per task, and a `task_id` per pair.

## 4. Judge anchoring for Suite v2

Suite v2 tasks make visual taste more consequential (marketing, creator), so
`visual_hierarchy` and `design_judgment` need anchored evidence:

- The Principles of Art section in `intelligence/VISUAL-DESIGN-PLAYBOOK.md` §4
  (focal point, movement, balance type, rhythm) **should** be cited by reviewers
  for those two dimensions, naming the principle and its failure mode.
- Marketing and creator tasks **must** score claim honesty separately from visual
  polish: a beautiful landing page that pushes a medical claim or a fake scarcity
  timer scores low on product understanding and UX reasoning even if it scores high
  on visual hierarchy.

## 5. Held-out selection criteria

A held-out task is an acceptance test for guidance changes: a change that improves
public tasks but regresses the held-out suite is rejected
(`benchmarks/CONFIRMATORY-STUDY.md` § Held-out suite). The three existing held-out
tasks are grandfathered. Any *new* held-out task must satisfy all of §5.1–§5.3.

### 5.1 Eligibility (must all pass)

1. **Archetype coverage:** the held-out set as a whole must cover every archetype
   the study's public tasks cover (`settings`, `onboarding`, `dashboard` today).
2. **Design-problem distinctness:** the task must test a design problem not already
   covered by another held-out task *for the same decision risk*. Two billing tasks
   are one held-out slot, not two. Diversity is measured by risk and decision, not
   by product name.
3. **Buildable and capturable:** demoable in one responsive HTML page in the time
   budget, with the 6 required interaction states reachable through the page's own
   controls at `390x844` and `1280x900`. If a state cannot be captured, the task
   is not ready.
4. **Gate-testable:** the deterministic gates (accessible names, axe critical/serious,
   mobile overflow, required states, claim-behavior) must be applicable to its
   evidence. A task whose risk cannot be gate-checked cannot be a held-out gate.
5. **Self-contained honesty:** 5–7 product facts, no invented APIs, research, or
   backend behavior; every risky claim is decidable from the brief alone.
6. **Reviewer-separable:** two blinded reviewers can score it from screenshots and
   artifacts without needing the build transcript. If the risk is invisible in
   rendered evidence, it belongs in a calibration seed, not a held-out task.

### 5.2 Preference (score candidates; pick the top 3)

Score each candidate 0–2 on each criterion; rank. Select the top 3 that together
satisfy §5.1 and span at least two product domains and two platform surfaces.

| Criterion | 0 | 1 | 2 |
|---|---|---|---|
| Domain distance from public tasks | Same SaaS admin surface | Adjacent (marketplace, creator) | Distant (consumer, health, civic, mobile utility) |
| Risk type distance | Same risk (billing clarity) | Mixed (billing + destructive) | New risk (medical caution, stale data, handover lockout) |
| State richness | 6 states, all default-like | 3+ distinct states | Pass/fail states the public tasks rarely trigger |
| Data-honesty trap | None | One trap (fee math, wait range) | Multiple traps (forecast, exact promise, hidden fee) |
| Platform spread | Desktop only | Responsive with reordering | Mobile-first or single-column utility |
| Anti-overfit value | Tasks the playbooks already solve | Partially covered | Playbooks visibly struggle (persuasion, creation, caution) |

*Minimum held-out bar:* total preference score ≥ 8 of 12, with at least one 2 in
domain distance and one 2 in risk-type distance. Marketing and creator tasks that
score high on visual taste but low on domain distance **should not** be selected over
a distant-domain task with a falsifiable risk.

### 5.3 Process

1. Author the candidate in `benchmarks/tasks/<task_id>.md` with the canonical seven
   sections and `Task version: <version>`.
2. Validate it like any task: confirm the 7 sections, the declared version, and that
   the deterministic gates are expected to pass on a clean build.
3. Record its archetype, domain, risk type, and preference scores (§5.2) in the
   study's `study-design.json` metadata (`status: to-author` → `ready`).
4. Freeze it (hash via `study:freeze`) before any guidance change it is meant to
   evaluate. **Never use a held-out task to edit guidance, prompts, or rubric
   anchors.** If a held-out task exposes a guidance defect, fix the guidance on
   public-task evidence only; re-run the held-out task to confirm.
5. Report held-out results alongside public results. A public-task gain with a
   held-out regression below the preregistered margin (-2 points) is a rejection,
   recorded as a negative result, not a partial win.

### 5.4 Suite v2 held-out candidates, ranked

| Candidate (new, from Suite v2) | Domain | Risk | Strength |
|---|---|---|---|
| `pharmacy-first-check-in` | Health / civic | Medical-caution, over-collection | Distant domain + new risk; falsifiable "diagnosis implied?" |
| `mobile-queue-status` | Mobile utility | Stale promise, literacy, offline | Mobile-first; exact-wait trap; freshness is gate-visible |
| `workspace-handover` | Collaboration | Lockout, silent transfer | New risk (handover), adjacent domain; high anti-overfit |
| `merchant-batch-settlement` | Commerce fintech | Fee opacity, forecast trap | Strong data-honesty trap; same archetype as existing dashboard |
| `creative-first-prompt` | Creator AI | Credit, quality claim | High visual taste variance — needs judge anchoring (§4) |
| `streaming-family-plan` | Consumer streaming | Hidden cancel, child safety | Near-archetype of existing billing — lower distinctness |
| `marketing-landing-claim` | Consumer marketing | Claim fabrication, dark patterns | Most subjective; use as held-out only with anchored rubric |

Recommendation: promote **`pharmacy-first-check-in`** and **`mobile-queue-status`**
plus one of **`workspace-handover`** / **`merchant-batch-settlement`** (to preserve a
dashboard anchor) as the next held-out set, keeping the current three held-out tasks in
place until the new set is frozen and validated.

## 6. What is not done here

- The validator's archetype list, template, and tests are unchanged. Adding
  `transactional`, `creation`, `advisory`, or `mobile-utility` archetypes requires
  the validator, `study-design.template.json`, and `tests/study-design.test.mjs` to
  be updated together, with its own issue and migration note.
- No new study is preregistered here. A Suite v2 study must copy
  `study-design.template.json`, fill in its builders/tasks, and pass
  `study:validate` before any run.
- The installed skill (`SKILL.md` and `intelligence/`) does not carry this suite.
  The suite is repository-side evidence infrastructure.

## Related

- [Benchmark protocol](README.md) — task set, paired study, gates, and scoring.
- [Confirmatory study design](CONFIRMATORY-STUDY.md) — preregistration, held-out suite, decision rule.
- [Visual Design Playbook](../intelligence/VISUAL-DESIGN-PLAYBOOK.md) — Principles of Art (§4) for judge anchoring.
