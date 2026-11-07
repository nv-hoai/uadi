import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { prepareBenchmarkPair } from "../scripts/prepare-benchmark-pair.mjs";

test("creates isolated clean condition copies and coordinator mapping", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "uadi-benchmark-"));
  try {
    const snapshot = path.join(root, "snapshot");
    await mkdir(snapshot);
    await writeFile(path.join(snapshot, "README.md"), "clean snapshot");
    const runsDir = path.join(root, "runs");
    const result = await prepareBenchmarkPair({
      studyId: "study-1", pairId: "pair-1", taskId: "product-onboarding", snapshot, runsDir
    });
    assert.deepEqual([...result.order].sort(), ["baseline", "uadi"]);
    for (const condition of ["baseline", "uadi"]) {
      const projectFile = path.join(result.pairDir, condition, "project/README.md");
      assert.equal(await readFile(projectFile, "utf8"), "clean snapshot");
      assert.ok(await readFile(path.join(result.pairDir, condition, "prompt.md"), "utf8"));
      assert.ok(await readFile(path.join(result.pairDir, condition, "transcript.md"), "utf8"));
    }
    const mapping = JSON.parse(await readFile(path.join(result.pairDir, "mapping.json"), "utf8"));
    assert.deepEqual(mapping.run_order, result.order);
    assert.deepEqual([...Object.values(mapping.blind_mapping)].sort(), ["baseline", "uadi"]);
    await stat(path.join(result.pairDir, "baseline/evidence/changed-files"));
    await assert.rejects(() => prepareBenchmarkPair({
      studyId: "study-1", pairId: "pair-1", taskId: "product-onboarding", snapshot, runsDir
    }), /Run already exists/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a preregistered schedule drives run order and candidate position deterministically", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "uadi-benchmark-schedule-"));
  try {
    const snapshot = path.join(root, "snapshot");
    await mkdir(snapshot);
    await writeFile(path.join(snapshot, "index.html"), "<h1>Task</h1>");
    const designFile = path.join(root, "study-design.json");
    const design = {
      study_id: "confirmatory-2026-11",
      design: {
        pairs: [
          { pair_id: "alpha-subscription-settings-r1", task_id: "subscription-settings", repetition: 1, uadi_position: "B", baseline_run_position: 2 },
          { pair_id: "alpha-subscription-settings-r2", task_id: "subscription-settings", repetition: 2, uadi_position: "A", baseline_run_position: 1 }
        ]
      }
    };
    await writeFile(designFile, JSON.stringify(design));

    const runsDir = path.join(root, "runs");
    const first = await prepareBenchmarkPair({
      studyId: "confirmatory-2026-11", pairId: "alpha-subscription-settings-r1",
      taskId: "subscription-settings", snapshot, studyDesign: designFile, runsDir
    });
    assert.deepEqual(first.order, ["uadi", "baseline"]);
    const mapping = JSON.parse(await readFile(path.join(first.pairDir, "mapping.json"), "utf8"));
    assert.deepEqual(mapping.blind_mapping, { "condition-a": "baseline", "condition-b": "uadi" });
    assert.equal(mapping.uadi_position, "B");
    assert.equal(mapping.baseline_run_position, 2);
    assert.equal(mapping.schedule, "preregistered");

    const second = await prepareBenchmarkPair({
      studyId: "confirmatory-2026-11", pairId: "alpha-subscription-settings-r2",
      taskId: "subscription-settings", snapshot, studyDesign: designFile, runsDir
    });
    assert.deepEqual(second.order, ["baseline", "uadi"]);
    const secondMapping = JSON.parse(await readFile(path.join(second.pairDir, "mapping.json"), "utf8"));
    assert.deepEqual(secondMapping.blind_mapping, { "condition-a": "uadi", "condition-b": "baseline" });
    assert.equal(secondMapping.uadi_position, "A");
    assert.equal(secondMapping.baseline_run_position, 1);

    const negativeRuns = path.join(root, "runs-negative");
    await assert.rejects(() => prepareBenchmarkPair({
      studyId: "confirmatory-2026-11", pairId: "unknown-pair",
      taskId: "subscription-settings", snapshot, studyDesign: designFile, runsDir: negativeRuns
    }), /not in the preregistered study design/);
    await assert.rejects(() => prepareBenchmarkPair({
      studyId: "other-study", pairId: "alpha-subscription-settings-r1",
      taskId: "subscription-settings", snapshot, studyDesign: designFile, runsDir: negativeRuns
    }), /does not match --study-id/);
    await assert.rejects(() => prepareBenchmarkPair({
      studyId: "confirmatory-2026-11", pairId: "alpha-subscription-settings-r1",
      taskId: "product-onboarding", snapshot, studyDesign: designFile, runsDir: negativeRuns
    }), /preregistered for task subscription-settings/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
