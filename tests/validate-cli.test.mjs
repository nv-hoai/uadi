import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = path.join(ROOT, "scripts/validate.mjs");
const fixture = JSON.parse(await readFile(path.join(ROOT, "examples/minimal/design-specification.json"), "utf8"));

async function withTempDir(run) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "uadi-validate-"));
  try { await run(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

test("validates a subject-named artifact from outside the repository", async () => {
  await withTempDir(async (cwd) => {
    await writeFile(path.join(cwd, "onboarding-design.json"), JSON.stringify(fixture));
    const result = spawnSync(process.execPath, [SCRIPT, "onboarding-design.json"], { cwd, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes("PASS onboarding-design.json"));
  });
});

test("supports an explicit schema for artifacts with ambiguous names", async () => {
  await withTempDir(async (cwd) => {
    await writeFile(path.join(cwd, "artifact.json"), JSON.stringify(fixture));
    const result = spawnSync(process.execPath, [SCRIPT, "--schema", "design-specification", "artifact.json"], { cwd, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  });
});

test("reports malformed and missing files without stack traces and continues", async () => {
  await withTempDir(async (cwd) => {
    await writeFile(path.join(cwd, "bad.json"), "{");
    await writeFile(path.join(cwd, "valid.json"), JSON.stringify(fixture));
    const result = spawnSync(process.execPath, [SCRIPT, "missing.json", "bad.json", "valid.json"], { cwd, encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.ok(result.stderr.includes("FAIL missing.json:"));
    assert.ok(result.stderr.includes("FAIL bad.json:"));
    assert.ok(result.stdout.includes("PASS valid.json"));
    assert.doesNotMatch(result.stderr, / at file:/);
  });
});

test("fails clearly when an unknown artifact name cannot be inferred", async () => {
  await withTempDir(async (cwd) => {
    await writeFile(path.join(cwd, "unknown.json"), JSON.stringify({ hello: "world" }));
    const result = spawnSync(process.execPath, [SCRIPT, "unknown.json"], { cwd, encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /pass --schema/);
  });
});
