import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = path.join(ROOT, "scripts/prototype-check.mjs");
const base = JSON.parse(fs.readFileSync(path.join(ROOT, "examples/minimal/design-specification.json"), "utf8"));

function check(spec) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uadi-prototype-"));
  const file = path.join(dir, "fixture.json");
  fs.writeFileSync(file, JSON.stringify(spec));
  const result = spawnSync(process.execPath, [SCRIPT, file], { encoding: "utf8" });
  fs.rmSync(dir, { recursive: true, force: true });
  return result;
}

test("prototype checker accepts a minimal supported UDS", () => {
  const result = check(base);
  assert.equal(result.status, 0, result.stderr);
});

test("prototype checker runs full UDS schema validation", () => {
  const invalid = structuredClone(base);
  invalid.pages[0].sections[2].layout.type = "password";
  const result = check(invalid);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /type/);
});

test("prototype checker rejects unsupported component IDs", () => {
  const invalid = structuredClone(base);
  invalid.pages[0].sections[0].component_id = "react.div";
  const result = check(invalid);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /component_id/);
});

test("prototype checker rejects component-specific layout violations", () => {
  const invalid = structuredClone(base);
  invalid.pages[0].sections[1].layout.items[0].icon = "house";
  const result = check(invalid);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must NOT have additional properties/);
});
