import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateStudyDesign } from "../scripts/validate-study-design.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = path.join(ROOT, "scripts/validate-study-design.mjs");
const HASH = "sha256:" + "a".repeat(64);

function validDesign() {
  const builders = [
    { model_family: "builder-a", model_version: "builder-a-v1", agent: "Example agent", settings: "identical tools and time budget" },
    { model_family: "builder-b", model_version: "builder-b-v1", agent: "Example agent", settings: "identical tools and time budget" }
  ];
  const tasks = [
    { task_id: "subscription-settings", archetype: "settings", task_version: "1.0.0", split: "public" },
    { task_id: "product-onboarding", archetype: "onboarding", task_version: "1.0.0", split: "public" },
    { task_id: "operations-dashboard", archetype: "dashboard", task_version: "1.0.0", split: "public" }
  ];
  const heldOutTasks = [
    { task_id: "held-out-billing-recovery", archetype: "settings", task_version: "1.0.0", status: "ready", used_for_guidance_changes: false },
    { task_id: "held-out-activation-recovery", archetype: "onboarding", task_version: "1.0.0", status: "ready", used_for_guidance_changes: false },
    { task_id: "held-out-capacity-investigation", archetype: "dashboard", task_version: "1.0.0", status: "ready", used_for_guidance_changes: false }
  ];
  const pairs = [];
  for (const [builderIndex, builder] of builders.entries()) {
    for (const task of tasks) {
      for (let repetition = 1; repetition <= 3; repetition += 1) {
        const isBuilderA = builderIndex === 0;
        const uadiPosition = isBuilderA ? (repetition === 2 ? "B" : "A") : (repetition === 2 ? "A" : "B");
        const baselineRunPosition = isBuilderA ? (repetition === 2 ? 2 : 1) : (repetition === 2 ? 1 : 2);
        pairs.push({
          pair_id: builder.model_family + "-" + task.task_id + "-r" + repetition,
          model_family: builder.model_family,
          task_id: task.task_id,
          repetition,
          uadi_position: uadiPosition,
          baseline_run_position: baselineRunPosition
        });
      }
    }
  }
  return {
    schema_version: 1,
    study_id: "confirmatory-example",
    status: "preregistered",
    design_type: "confirmatory-machine",
    protocol_version: "confirmatory-1",
    created_at: "2026-11-07",
    hypothesis: {
      primary: "UADI improves weighted design quality.",
      direction: "superiority",
      primary_outcome: "paired weighted-score delta",
      minimum_detectable_effect_points: 4,
      alpha: 0.05
    },
    builders,
    tasks,
    held_out_tasks: heldOutTasks,
    frozen: { snapshot_hash: HASH, prompt_hash: HASH, skill_hash: HASH, time_budget_minutes: 20 },
    design: { repetitions: 3, assumed_pair_sd_points: 7.5, pairs },
    review: {
      reviewer_families: [
        { model_family: "reviewer-a", model_version: "reviewer-a-v1" },
        { model_family: "reviewer-b", model_version: "reviewer-b-v1" }
      ],
      reviewers_per_condition: 2,
      builder_family_excluded: true,
      blinded: true,
      calibration: {
        seed_pairs: 3,
        clean_seed_pairs: 1,
        required_critical_defects: ["accessible-name", "claim-behavior-mismatch", "sort-order-mismatch"],
        duplicate_packet: true
      },
      state_capture: {
        viewports: ["390x844", "1280x900"],
        required_states: ["default", "loading", "empty", "error", "success", "restricted"],
        hide_prototype_chrome: true
      }
    },
    decision_rule: {
      primary_outcome: "paired weighted-score delta",
      confidence_interval: "paired 95% t interval",
      superiority_requires_ci_lower_bound_above: 0,
      minimum_effect_points: 4,
      no_task_or_family_regression_below_points: -2,
      require_order_balance: true,
      require_reviewer_calibration: true,
      require_held_out_suite_for_guidance_changes: true
    },
    execution: {
      mode: "sequential",
      concurrency: "none",
      time_budget_minutes: 20,
      record_tokens: true,
      record_cost: true
    },
    reporting: {
      report_by: ["model_family", "task", "dimension"],
      publish_reviewer_disagreement: true,
      publish_position_sensitivity: true,
      publish_cost: true,
      publish_negative_results: true
    }
  };
}

test("valid study design passes with balanced order and independent reviewers", () => {
  const result = validateStudyDesign(validDesign());
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.summary.expected_pairs, 18);
  assert.equal(result.summary.order_balance.balanced, true);
  assert.equal(result.summary.run_order_balance.balanced, true);
  assert.deepEqual(result.summary.builder_reviewer_overlap, []);
});

test("the committed template is valid and only warns about placeholders", async () => {
  const template = JSON.parse(await readFile(path.join(ROOT, "benchmarks/study-design.template.json"), "utf8"));
  const result = validateStudyDesign(template);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.ok(result.warnings.some((warning) => warning.message.includes("placeholder")));
});

test("rejects an unbalanced candidate position schedule", () => {
  const input = validDesign();
  for (const pair of input.design.pairs) pair.uadi_position = "A";
  const result = validateStudyDesign(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.message.includes("balance UADI Candidate A and B")));
});

test("rejects reviewers from a builder model family", () => {
  const input = validDesign();
  input.review.reviewer_families = [
    { model_family: "builder-a", model_version: "builder-a-v1" },
    { model_family: "reviewer-b", model_version: "reviewer-b-v1" }
  ];
  const result = validateStudyDesign(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.message.includes("must not share a builder family")));
});

test("requires a held-out task for every archetype", () => {
  const input = validDesign();
  input.held_out_tasks = input.held_out_tasks.filter((task) => task.archetype !== "dashboard");
  const result = validateStudyDesign(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.message.includes("dashboard archetype")));
});

test("requires calibration seeds and a duplicate packet", () => {
  const input = validDesign();
  input.review.calibration.seed_pairs = 1;
  input.review.calibration.duplicate_packet = false;
  const result = validateStudyDesign(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.path.includes("seed_pairs")));
  assert.ok(result.errors.some((error) => error.path.includes("duplicate_packet")));
});

test("requires interaction state captures and hidden prototype chrome", () => {
  const input = validDesign();
  input.review.state_capture.required_states = ["default"];
  input.review.state_capture.hide_prototype_chrome = false;
  const result = validateStudyDesign(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.path.includes("required_states")));
  assert.ok(result.errors.some((error) => error.path.includes("hide_prototype_chrome")));
});

test("rejects duplicate pair identifiers and missing version hashes", () => {
  const input = validDesign();
  input.design.pairs[1].pair_id = input.design.pairs[0].pair_id;
  delete input.frozen.skill_hash;
  const result = validateStudyDesign(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.message.includes("must be unique")));
  assert.ok(result.errors.some((error) => error.path.includes("skill_hash")));
});

test("a design with concrete model families is runnable", () => {
  const input = validDesign();
  const renamed = JSON.stringify(input)
    .replaceAll("builder-a", "builder-family-one")
    .replaceAll("builder-b", "builder-family-two")
    .replaceAll("reviewer-a", "judge-family-one")
    .replaceAll("reviewer-b", "judge-family-two");
  const result = validateStudyDesign(JSON.parse(renamed));
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(result.summary.runnable, true);
  assert.equal(result.summary.blocked_reason, null);
});

function fakeTaskContent(version = "1.0.0") {
  return ["# Task", "", "Task version: " + version, "",
    "## Scenario", "text",
    "## Product facts", "text",
    "## Primary users and outcomes", "text",
    "## Constraints and risks", "text",
    "## Task prompt", "text",
    "## Expected deliverables", "text",
    "## Reviewer questions", "text"].join("\n");
}

function taskContext(input) {
  const taskContents = {};
  for (const task of [...input.tasks, ...input.held_out_tasks]) {
    taskContents[task.task_id] = fakeTaskContent(task.task_version);
  }
  return { taskContents, guidanceSources: [{ path: "SKILL.md", content: "# Skill\n\nNo task identifiers here." }] };
}

test("reviewer entries missing a pinned version are rejected", () => {
  const input = validDesign();
  input.review.reviewer_families = [{ model_family: "judge-a" }, { model_family: "judge-b", model_version: "judge-b-v1" }];
  const result = validateStudyDesign(input);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.path.includes("model_version")));
});

test("task files must exist, carry the canonical sections and the declared version", () => {
  const input = validDesign();
  const context = taskContext(input);
  assert.equal(validateStudyDesign(input, context).valid, true, "all files present");

  const missing = taskContext(input);
  missing.taskContents["operations-dashboard"] = null;
  const missingResult = validateStudyDesign(input, missing);
  assert.equal(missingResult.valid, false);
  assert.ok(missingResult.errors.some((error) => error.message.includes("task file benchmarks/tasks/operations-dashboard.md not found")));

  const wrongVersion = taskContext(input);
  wrongVersion.taskContents["product-onboarding"] = fakeTaskContent("9.9.9");
  const versionResult = validateStudyDesign(input, wrongVersion);
  assert.equal(versionResult.valid, false);
  assert.ok(versionResult.errors.some((error) => error.message.includes("Task version: 1.0.0")));

  const noSections = taskContext(input);
  noSections.taskContents["held-out-billing-recovery"] = "# Task\n\nTask version: 1.0.0\n\n## Scenario\ntext";
  const sectionResult = validateStudyDesign(input, noSections);
  assert.equal(sectionResult.valid, false);
  assert.ok(sectionResult.errors.some((error) => error.message.includes("missing the \"## Task prompt\" section")));
});

test("a held-out task identifier appearing in guidance or prompt content is rejected", () => {
  const input = validDesign();
  const context = taskContext(input);
  context.guidanceSources.push({ path: "intelligence/UX-REASONING-PLAYBOOK.md", content: "See held_out_capacity_investigation for details." });
  const result = validateStudyDesign(input, context);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.message.includes("appears in guidance or prompt content")));
});

test("placeholder families are not runnable; malformed frozen hashes are rejected", () => {
  const placeholders = validateStudyDesign(validDesign());
  assert.equal(placeholders.valid, true);
  assert.equal(placeholders.summary.runnable, false);
  assert.equal(placeholders.summary.blocked_reason, "pending family selection");

  const input = validDesign();
  input.frozen.skill_hash = "not-a-digest";
  const malformed = validateStudyDesign(input);
  assert.equal(malformed.valid, false);
  assert.ok(malformed.errors.some((error) => error.path === "frozen.skill_hash"));
});

test("CLI returns a non-zero status for an invalid design", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "uadi-study-design-"));
  try {
    const input = validDesign();
    input.execution.mode = "concurrent";
    const file = path.join(dir, "study-design.json");
    await writeFile(file, JSON.stringify(input));
    const result = spawnSync(process.execPath, [SCRIPT, file], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /ERROR execution\.mode/);
    assert.doesNotMatch(result.stderr, / at file:/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
