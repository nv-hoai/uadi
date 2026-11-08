import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildContextReport,
  classifyPath,
  estimateTokens,
  formatContextReport
} from "../scripts/context-report.mjs";
import { appendReadEvent } from "../scripts/context-read.mjs";
import {
  formatContextLogReport,
  parseContextLog,
  summarizeContextEvents,
  validateContextLog,
  validateContextLogWithPaths
} from "../scripts/validate-context-log.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("token estimates are chars/4 and classified by runtime layer", () => {
  assert.equal(estimateTokens(""), 0);
  assert.equal(estimateTokens("abcd"), 1);
  assert.equal(estimateTokens("abcde"), 2);
  assert.equal(classifyPath("SKILL.md"), "kernel");
  assert.equal(classifyPath("docs/DESIGN-INTELLIGENCE.md"), "core");
  assert.equal(classifyPath("intelligence/UX-REASONING-PLAYBOOK.md"), "module");
  assert.equal(classifyPath("intelligence/patterns/forms-and-validation.md"), "pattern");
  assert.equal(classifyPath("examples/minimal/design-specification.json"), "example");
  assert.equal(classifyPath("schemas/project-context.schema.json"), "contract");
});

test("static report separates installed footprint from load profiles", async () => {
  const report = await buildContextReport(ROOT);
  assert.ok(report.inventory.some((entry) => entry.path === "SKILL.md"));
  assert.ok(report.inventory.some((entry) => entry.path === "docs/DESIGN-INTELLIGENCE.md"));
  assert.match(report.estimate_method, /chars\/4/);
  assert.ok(report.profiles.always.tokens_est >= (report.kernel?.tokens_est ?? 0));
  assert.ok(report.profiles.typical.tokens_est >= report.profiles.always.tokens_est);
  assert.ok(report.profiles.deep.tokens_est >= report.profiles.typical.tokens_est);
  assert.ok(report.profiles.installed.tokens_est >= report.profiles.example.tokens_est);
  assert.equal(report.profiles.always.count, 2);
  assert.equal(report.missing.length, 0);
  const markdown = formatContextReport(report);
  assert.match(markdown, /Static audit|static audit/);
  assert.match(markdown, /Installed files are not the same as loaded context/);
});

test("read wrapper appends machine-readable events and detects repeats", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "uadi-context-"));
  try {
    await writeFile(path.join(dir, "SKILL.md"), "a".repeat(400), "utf8");
    const log = path.join(dir, "events.jsonl");
    await appendReadEvent({ root: dir, log, turn: 1, path: "SKILL.md", section: "Start here" });
    await appendReadEvent({ root: dir, log, turn: 2, path: "SKILL.md", section: "Start here" });

    const text = await readFile(log, "utf8");
    const parsed = parseContextLog(text);
    assert.equal(parsed.errors.length, 0);
    assert.equal(parsed.events.length, 2);
    assert.equal(parsed.events[0].source, "wrapper");
    assert.equal(parsed.events[0].tokens_est, 100);

    const validation = await validateContextLogWithPaths(parsed.events, { root: dir, checkPaths: true });
    assert.equal(validation.valid, true);
    assert.equal(validation.errors.length, 0);

    const summary = summarizeContextEvents(parsed.events);
    assert.equal(summary.file_count ?? summary.files, 1);
    assert.equal(summary.repeated_reads.length, 1);
    assert.equal(summary.repeated_reads[0].count, 2);
    assert.equal(summary.evidence_tier, "wrapper");
    assert.match(formatContextLogReport(summary), /Evidence tier: \*\*wrapper\*\*/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("path safety rejects escapes and missing files", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "uadi-context-"));
  try {
    await writeFile(path.join(dir, "SKILL.md"), "safe", "utf8");
    await assert.rejects(
      () => appendReadEvent({ root: dir, log: path.join(dir, "events.jsonl"), turn: 1, path: "../outside.md" }),
      /escapes the project root/
    );

    const events = [
      { ts: new Date().toISOString(), turn: 1, tool: "read", path: "missing.md", bytes: 4, tokens_est: 1, source: "wrapper" }
    ];
    const validation = await validateContextLogWithPaths(events, { root: dir, checkPaths: true });
    assert.equal(validation.valid, false);
    assert.ok(validation.errors.some((error) => error.includes("does not exist")));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("schema validation rejects unsafe paths, bad sources and malformed lines", () => {
  const base = { ts: new Date().toISOString(), turn: 1, tool: "read", path: "SKILL.md", bytes: 4, tokens_est: 1 };
  const unsafe = validateContextLog([{ ...base, source: "wrapper", path: "../secret.md" }]);
  assert.equal(unsafe.valid, false);
  assert.ok(unsafe.errors.some((error) => error.includes("safe relative path")));

  const badSource = validateContextLog([{ ...base, source: "some_model" }]);
  assert.equal(badSource.valid, false);
  assert.ok(badSource.errors.some((error) => error.includes("source must be one of")));

  const parsed = parseContextLog("{not json}\n" + JSON.stringify({ ...base, source: "self_report" }) + "\n");
  assert.equal(parsed.errors.length, 1);
  assert.equal(parsed.events.length, 1);
  assert.equal(validateContextLog(parsed.events).evidence_tier, "self_reported");
});

test("mixed sources are labelled mixed, host events are instrumented", () => {
  const base = { ts: new Date().toISOString(), turn: 1, tool: "read", path: "SKILL.md", bytes: 4, tokens_est: 1 };
  assert.equal(validateContextLog([{ ...base, source: "host_event" }]).evidence_tier, "instrumented");
  assert.equal(validateContextLog([{ ...base, source: "host_event" }, { ...base, source: "wrapper" }]).evidence_tier, "mixed");
});
