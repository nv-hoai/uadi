import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
test("prototype checker accepts a minimal supported UDS", () => {
 const file = path.join(os.tmpdir(), "uadi-prototype-fixture.json");
 fs.writeFileSync(file, JSON.stringify({ pages: [{ page_id: "home", name: "Home", sections: [{ section_id: "hero", component_id: "uadi.layout.page-shell" }] }] }));
 const result = spawnSync(process.execPath, ["scripts/prototype-check.mjs", file], { encoding: "utf8" });
 fs.unlinkSync(file);
 assert.equal(result.status, 0, result.stderr);
});
test("prototype checker rejects unsupported component IDs", () => {
 const file = path.join(os.tmpdir(), "uadi-prototype-invalid.json");
 fs.writeFileSync(file, JSON.stringify({ pages: [{ page_id: "home", name: "Home", sections: [{ section_id: "bad", component_id: "react.div" }] }] }));
 const result = spawnSync(process.execPath, ["scripts/prototype-check.mjs", file], { encoding: "utf8" });
 fs.unlinkSync(file);
 assert.equal(result.status, 1);
 assert.match(result.stderr, /Unsupported component ID/);
});
