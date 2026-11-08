import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  buildMemoryBrief,
  createMemory,
  resolveMemory,
  validateMemory
} from "../scripts/design-memory.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NOW = new Date("2026-06-01T00:00:00.000Z");

function entry(overrides = {}) {
  return {
    id: "DM-001",
    kind: "CONSTRAINT",
    scope: { level: "PROJECT" },
    statement: "Owners alone can change billing.",
    status: "APPROVED",
    provenance: { source: "OWNER", ref: "workshop-2026-05", confidence: 0.9 },
    approved_by: "owner",
    approved_at: "2026-05-01T00:00:00.000Z",
    ...overrides
  };
}

function memory(entries) {
  return {
    schema_version: "1.0.0",
    project_id: "harbor-studio",
    updated_at: "2026-05-01T00:00:00.000Z",
    entries
  };
}

test("validates a well-formed memory file and rejects broken entries", () => {
  const valid = memory([entry()]);
  const result = validateMemory(valid);
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);

  const missingApproval = validateMemory(memory([entry({ approved_by: undefined })]));
  assert.equal(missingApproval.valid, false);
  assert.ok(missingApproval.errors.some((error) => error.includes("approved_by")));

  const duplicate = validateMemory(memory([entry(), entry()]));
  assert.equal(duplicate.valid, false);
  assert.ok(duplicate.errors.some((error) => error.includes("duplicated")));

  const badConfidence = validateMemory(memory([entry({ provenance: { source: "OWNER", confidence: 1.4 } })]));
  assert.equal(badConfidence.valid, false);
  assert.ok(badConfidence.errors.some((error) => error.includes("confidence")));

  const selfSupersede = validateMemory(memory([entry({ supersedes: ["DM-001"] })]));
  assert.equal(selfSupersede.valid, false);
  assert.ok(selfSupersede.errors.some((error) => error.includes("cannot include itself")));
});

test("resolves approved, proposed, superseded, expired and stale entries", () => {
  const data = memory([
    entry({ id: "DM-001", statement: "Old billing rule." }),
    entry({
      id: "DM-002",
      kind: "DECISION",
      statement: "Billing changes require owner confirmation.",
      supersedes: ["DM-001"]
    }),
    entry({ id: "DM-003", status: "PROPOSED", statement: "Maybe add annual billing.", approved_by: undefined, approved_at: undefined }),
    entry({ id: "DM-004", status: "EXPIRED", statement: "Old preference.", approved_by: undefined, approved_at: undefined }),
    entry({ id: "DM-005", status: "SUPERSEDED", statement: "Old direction.", approved_by: undefined, approved_at: undefined }),
    entry({ id: "DM-006", statement: "Stale assumption.", review_after: "2026-01-01T00:00:00.000Z" })
  ]);
  const resolved = resolveMemory(data, NOW);
  assert.deepEqual(resolved.approved.map((item) => item.id), ["DM-002", "DM-006"]);
  assert.deepEqual(resolved.proposed.map((item) => item.id), ["DM-003"]);
  assert.deepEqual(resolved.expired.map((item) => item.id), ["DM-004"]);
  assert.deepEqual(resolved.superseded.map((item) => item.id).sort(), ["DM-001", "DM-005"]);
  assert.deepEqual(resolved.stale.map((item) => item.id), ["DM-006"]);
  assert.equal(resolved.superseded_by["DM-001"], "DM-002");
});

test("brief contains approved constraints, proposed hypotheses and review warnings", () => {
  const data = memory([
    entry({ id: "DM-001", statement: "Owners alone can change billing." }),
    entry({ id: "DM-002", kind: "REJECTED_DIRECTION", statement: "Do not use a pricing toggle as a commitment.", rationale: "It implies a change that did not happen." }),
    entry({ id: "DM-003", status: "PROPOSED", statement: "Consider annual billing later.", approved_by: undefined, approved_at: undefined }),
    entry({ id: "DM-004", status: "SUPERSEDED", statement: "Old direction that must not appear.", approved_by: undefined, approved_at: undefined }),
    entry({ id: "DM-005", statement: "Stale assumption.", review_after: "2026-01-01T00:00:00.000Z" })
  ]);
  const brief = buildMemoryBrief(data, { now: NOW });
  assert.match(brief, /# Design memory — harbor-studio/);
  assert.match(brief, /Owners alone can change billing/);
  assert.match(brief, /Do not use a pricing toggle/);
  assert.match(brief, /Proposed — not constraints/);
  assert.match(brief, /Consider annual billing/);
  assert.doesNotMatch(brief, /Old direction that must not appear/);
  assert.match(brief, /Needs review/);
  assert.match(brief, /DM-005/);
});

test("createMemory produces a valid empty memory", () => {
  const data = createMemory("harbor-studio", NOW);
  assert.equal(validateMemory(data).valid, true);
  assert.equal(data.entries.length, 0);
  assert.match(buildMemoryBrief(data, { now: NOW }), /No approved entries yet/);
});

test("template validates against the JSON Schema", () => {
  const result = spawnSync(process.execPath, [path.join(ROOT, "scripts/validate.mjs"), path.join(ROOT, "templates/design-memory.json")], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /PASS/);
});

test("init and brief CLI round-trip in a temporary project", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "uadi-memory-"));
  try {
    const file = path.join(dir, ".uadi/design-memory.json");
    const init = spawnSync(process.execPath, [path.join(ROOT, "scripts/design-memory.mjs"), "init", "--file", file, "--project-id", "harbor-studio"], { encoding: "utf8" });
    assert.equal(init.status, 0, init.stderr);
    const created = JSON.parse(await readFile(file, "utf8"));
    assert.equal(created.project_id, "harbor-studio");
    assert.equal(validateMemory(created).valid, true);

    created.entries.push(entry());
    await writeFile(file, JSON.stringify(created, null, 2) + "\n", "utf8");
    const out = path.join(dir, ".uadi/DESIGN-MEMORY.md");
    const brief = spawnSync(process.execPath, [path.join(ROOT, "scripts/design-memory.mjs"), "brief", "--file", file, "--out", out], { encoding: "utf8" });
    assert.equal(brief.status, 0, brief.stderr);
    assert.match(await readFile(out, "utf8"), /Owners alone can change billing/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("worked example validates and its generated brief stays compact", async () => {
  const file = path.join(ROOT, "examples/design-memory/design-memory.json");
  const data = JSON.parse(await readFile(file, "utf8"));
  assert.equal(validateMemory(data).valid, true);
  const brief = buildMemoryBrief(data, { now: NOW });
  const committed = await readFile(path.join(ROOT, "examples/design-memory/DESIGN-MEMORY.md"), "utf8");
  assert.equal(brief.trim(), committed.trim());
  assert.ok(Math.ceil(brief.length / 4) <= 700, "brief must stay within the compact budget");
});
