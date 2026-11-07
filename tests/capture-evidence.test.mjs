import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { captureEvidence } from "../scripts/capture-evidence.mjs";

const STATE_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body>
<label for="state">State</label>
<select id="state">
<option value="default">default</option>
<option value="error">error</option>
</select>
<p data-state="default">default view</p>
<p data-state="error" hidden>error view</p>
<script>
(function(){var s=document.getElementById("state");
function show(){document.querySelectorAll("[data-state]").forEach(function(el){el.hidden=el.dataset.state!==s.value;});}
s.addEventListener("change",show);show();})();
</script></body></html>`;

test("captures canonically named screenshots, activating states through page controls", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "uadi-capture-"));
  try {
    const indexHtml = path.join(root, "index.html");
    await writeFile(indexHtml, STATE_PAGE);
    const out = path.join(root, "shots");
    const summary = await captureEvidence(indexHtml, { out, states: ["default", "error"], viewports: ["390x844"] });
    assert.equal(summary.total, 2);
    assert.equal(summary.all_activated, true);
    assert.deepEqual(summary.captures.map((c) => c.file), ["390x844-default.png", "390x844-error.png"]);
    assert.equal(summary.captures[1].strategy, "select");
    for (const file of ["390x844-default.png", "390x844-error.png"]) {
      const info = await stat(path.join(out, file));
      assert.ok(info.size > 0, file + " should be non-empty");
    }
    assert.deepEqual((await readdir(out)).sort(), ["390x844-default.png", "390x844-error.png"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a state with no activation control is reported honestly, not silently captured", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "uadi-capture-noact-"));
  try {
    const indexHtml = path.join(root, "index.html");
    await writeFile(indexHtml, '<!doctype html><html lang="en"><body><p>static</p></body></html>');
    const out = path.join(root, "shots");
    const summary = await captureEvidence(indexHtml, { out, states: ["default", "restricted"], viewports: ["390x844"] });
    assert.equal(summary.total, 2);
    assert.equal(summary.all_activated, false);
    const restricted = summary.captures.find((c) => c.state === "restricted");
    assert.equal(restricted.activated, false);
    assert.equal(restricted.strategy, null);
    // The file still exists so the gap is visible, but the summary never claims success.
    assert.ok(await stat(path.join(out, "390x844-restricted.png")));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
