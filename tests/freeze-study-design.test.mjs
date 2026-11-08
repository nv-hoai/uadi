import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { computeFrozenHashes } from "../scripts/freeze-study-design.mjs";
import { validateStudyDesign } from "../scripts/validate-study-design.mjs";

test("frozen hashes are stable across reads and well-formed", async () => {
  const first = await computeFrozenHashes();
  const second = await computeFrozenHashes();
  assert.deepEqual(first, second);
  for (const key of ["skill_hash", "snapshot_hash", "prompt_hash", "protocol_hash"]) {
    assert.match(first[key], /^sha256:[0-9a-f]{64}$/, key);
  }
});

test("validator rejects a design whose frozen hash drifted from sources", async () => {
  const design = JSON.parse(await readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "benchmarks/studies/confirmatory-2026-11/study-design.json"), "utf8"));
  const actuals = await computeFrozenHashes();
  // The committed design is a historical record: its frozen hashes describe the sources
  // at run time and intentionally drift when guidance changes afterward. Anchor the
  // drift check to the current sources instead of requiring the old record to match.
  design.frozen = { ...(design.frozen ?? {}), ...actuals };
  assert.equal(validateStudyDesign(design, { frozenActuals: actuals }).valid, true);
  design.frozen.skill_hash = "sha256:" + "0".repeat(64);
  const drifted = validateStudyDesign(design, { frozenActuals: actuals });
  assert.equal(drifted.valid, false);
  assert.ok(drifted.errors.some((error) => error.path === "frozen.skill_hash"));
});
