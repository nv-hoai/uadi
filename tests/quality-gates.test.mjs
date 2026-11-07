import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runQualityGates, unnamedControls } from "../scripts/quality-gates.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GOOD = path.join(ROOT, "tests/fixtures/quality-gates/good");
const BAD = path.join(ROOT, "tests/fixtures/quality-gates/bad");

test("unnamedControls flags icon-only controls but accepts labelled ones", () => {
  assert.deepEqual(unnamedControls('<button aria-label="Save">Save</button>'), []);
  assert.deepEqual(unnamedControls('<button>Save</button>'), []);
  assert.deepEqual(unnamedControls('<label for="n">Name</label><input id="n" type="text">'), []);
  assert.deepEqual(unnamedControls('<input type="text" placeholder="Search">'), []);
  assert.equal(unnamedControls('<button><svg aria-hidden="true"></svg></button>').length, 1);
  assert.equal(unnamedControls('<input type="text">').length, 1);
});

test("static gates pass on the good fixture and browser gates skip cleanly", async () => {
  const result = await runQualityGates(GOOD, { enableBrowser: true });
  const byId = Object.fromEntries(result.gates.map((g) => [g.id, g.status]));
  for (const id of ["accessible-names", "viewport-evidence", "required-states", "claim-behavior"]) {
    assert.equal(byId[id], "pass", id + " should pass on the good fixture");
  }
  // The browser gates either run (chromium present) or skip with a reason; never fail or crash.
  assert.ok(["pass", "skipped"].includes(byId.axe));
  assert.ok(["pass", "skipped"].includes(byId["mobile-overflow"]));
  assert.equal(result.ok, true);
});

test("static gates fail on the bad fixture with named violations", async () => {
  const result = await runQualityGates(BAD, { enableBrowser: false });
  const byId = Object.fromEntries(result.gates.map((g) => [g.id, g]));
  assert.equal(byId["accessible-names"].status, "fail");
  assert.equal(byId["accessible-names"].violations, 1);
  assert.equal(byId["viewport-evidence"].status, "fail");
  assert.equal(byId["required-states"].status, "fail");
  assert.ok(byId["required-states"].missing_states.includes("loading"));
  assert.ok(byId["required-states"].missing_states.includes("restricted"));
  assert.equal(byId["claim-behavior"].status, "fail");
  assert.equal(byId.axe.status, "skipped");
  assert.equal(byId["mobile-overflow"].status, "skipped");
  assert.equal(result.ok, false);
});

test("a missing deliverable fails with a clear gate instead of a crash", async () => {
  const result = await runQualityGates(path.join(ROOT, "tests/fixtures/quality-gates/does-not-exist"), { enableBrowser: false });
  assert.equal(result.ok, false);
  assert.equal(result.gates[0].id, "deliverable");
  assert.equal(result.gates[0].status, "fail");
});
