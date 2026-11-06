import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { prepareBenchmarkPair } from "../scripts/prepare-benchmark-pair.mjs";

test("creates isolated clean condition copies and coordinator mapping", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "uadi-benchmark-"));
  try {
    const snapshot = path.join(root, "snapshot");
    const runsDir = path.join(root, "runs");
    await mkdir(snapshot);
    await writeFile(path.join(snapshot, "README.md"), "clean snapshot");
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
    assert.ok(await readFile(path.join(result.pairDir, "blind/condition-a/.gitkeep").replace(".gitkeep","../..").replace(/\/\.\.$/,"/mapping.json").replace(/\/mapping\.json$/,"/mapping.json"), "utf8").catch(()=> ""));
    await assert.rejects(() => prepareBenchmarkPair({
      studyId: "study-1", pairId: "pair-1", taskId: "product-onboarding", snapshot, runsDir
    }), /Run already exists/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
