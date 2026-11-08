#!/usr/bin/env node
// Validate and summarise a UADI context log.
//
// A context log is JSONL, one machine-readable read event per line. The
// validator checks the event shape, path safety, chronology and aggregate
// consistency, then emits a Markdown report. It never claims to prove that a
// read occurred; that is what the event source and evidence tier are for.
//
// Usage:
//   node scripts/validate-context-log.mjs --log <events.jsonl> [--json] [--strict] [--check-paths]
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONTEXT_EVENT_SOURCES } from "./context-read.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const CONTEXT_EVENT_FIELDS = ["ts", "turn", "tool", "path", "bytes", "tokens_est", "source"];

function isIsoDate(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) && value.includes("T");
}

function isSafeRelative(file) {
  if (typeof file !== "string" || file.trim().length === 0) return false;
  if (path.isAbsolute(file)) return false;
  const normalized = path.normalize(file);
  return normalized !== ".." && !normalized.startsWith(".." + path.sep);
}

function sourceTier(sources) {
  if (sources.has("host_event")) return "instrumented";
  if (sources.has("wrapper")) return "wrapper";
  return "self_reported";
}

export function parseContextLog(text) {
  const events = [];
  const errors = [];
  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("event must be an object");
      events.push(parsed);
    } catch (error) {
      errors.push("line " + (index + 1) + ": " + error.message);
    }
  }
  return { events, errors };
}

export function validateContextLog(events, options = {}) {
  const errors = [];
  const warnings = [];
  const root = path.resolve(options.root ?? ROOT);
  let previous = null;
  const sources = new Set();

  for (const [index, event] of events.entries()) {
    const where = "events[" + index + "]";
    if (!isIsoDate(event.ts)) errors.push(where + ".ts must be an ISO timestamp");
    if (!Number.isInteger(event.turn) || event.turn < 0) errors.push(where + ".turn must be a non-negative integer");
    if (typeof event.tool !== "string" || !event.tool.trim()) errors.push(where + ".tool is required");
    if (!isSafeRelative(event.path)) errors.push(where + ".path must be a safe relative path inside the project");
    if (!Number.isFinite(event.tokens_est) || event.tokens_est < 0) errors.push(where + ".tokens_est must be a non-negative number");
    if (!CONTEXT_EVENT_SOURCES.includes(event.source)) {
      errors.push(where + ".source must be one of " + CONTEXT_EVENT_SOURCES.join(", "));
    } else {
      sources.add(event.source);
    }
    if (event.section !== undefined && (typeof event.section !== "string" || !event.section.trim())) {
      errors.push(where + ".section must be a non-empty string when supplied");
    }
    if (event.bytes !== undefined && (!Number.isFinite(event.bytes) || event.bytes < 0)) {
      errors.push(where + ".bytes must be a non-negative number when supplied");
    }
    if (Number.isFinite(event.bytes) && Number.isFinite(event.tokens_est)) {
      const expected = Math.ceil(event.bytes / 4);
      if (Math.abs(event.tokens_est - expected) > Math.max(10, expected * 0.1)) {
        warnings.push(where + ".tokens_est does not match chars/4 estimate from bytes (" + event.tokens_est + " vs " + expected + ")");
      }
    }
    if (isIsoDate(event.ts)) {
      const time = Date.parse(event.ts);
      if (previous !== null && time < previous) warnings.push(where + ".ts is earlier than the previous event");
      previous = time;
    }
    if (options.checkPaths && isSafeRelative(event.path)) {
      const absolute = path.resolve(root, event.path);
      const relative = path.relative(root, absolute);
      if (relative.startsWith(".." + path.sep) || relative === ".." || path.isAbsolute(relative)) {
        errors.push(where + ".path escapes the project root");
      } else {
        // Existence is checked asynchronously below so the validator stays a
        // pure function for unit tests without the filesystem.
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    evidence_tier: sources.size === 0 ? "unknown" : sources.size > 1 ? "mixed" : sourceTier(sources)
  };
}

export async function validateContextLogWithPaths(events, options = {}) {
  const result = validateContextLog(events, options);
  if (!options.checkPaths) return result;
  const root = path.resolve(options.root ?? ROOT);
  for (const [index, event] of events.entries()) {
    if (!isSafeRelative(event.path)) continue;
    try {
      const info = await stat(path.resolve(root, event.path));
      if (!info.isFile()) result.errors.push("events[" + index + "].path is not a file: " + event.path);
    } catch {
      result.errors.push("events[" + index + "].path does not exist: " + event.path);
    }
  }
  result.valid = result.errors.length === 0;
  return result;
}

export function summarizeContextEvents(events) {
  const bySource = {};
  const byPath = new Map();
  const seen = new Map();
  let totalTokens = 0;
  let previousTurn = null;

  for (const event of events) {
    bySource[event.source] = (bySource[event.source] ?? 0) + 1;
    totalTokens += Number(event.tokens_est) || 0;
    const key = event.path + "\u0000" + (event.section ?? "");
    seen.set(key, (seen.get(key) ?? 0) + 1);
    const existing = byPath.get(event.path) ?? { path: event.path, events: 0, tokens_est: 0, sections: new Set() };
    existing.events += 1;
    existing.tokens_est += Number(event.tokens_est) || 0;
    if (event.section) existing.sections.add(event.section);
    byPath.set(event.path, existing);
    if (Number.isInteger(event.turn)) previousTurn = event.turn;
  }

  const repeated = [];
  for (const [key, count] of seen.entries()) {
    if (count < 2) continue;
    const [file, section] = key.split("\u0000");
    repeated.push({ path: file, section: section || null, count });
  }
  repeated.sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));

  const files = [...byPath.values()]
    .map((entry) => ({ ...entry, sections: [...entry.sections].sort() }))
    .sort((a, b) => b.tokens_est - a.tokens_est || a.path.localeCompare(b.path));

  const sources = new Set(Object.keys(bySource));
  return {
    events: events.length,
    files: files.length,
    distinct_sections: new Set(events.map((event) => event.path + "\u0000" + (event.section ?? ""))).size,
    total_tokens_est: totalTokens,
    last_turn: previousTurn,
    by_source: bySource,
    files_detail: files,
    repeated_reads: repeated,
    evidence_tier: sources.size === 0 ? "unknown" : sources.size > 1 ? "mixed" : sourceTier(sources)
  };
}

function table(rows, columns) {
  const header = "| " + columns.map((column) => column.label).join(" | ") + " |";
  const rule = "| " + columns.map(() => "---").join(" | ") + " |";
  const body = rows.map((row) => "| " + columns.map((column) => String(column.value(row))).join(" | ") + " |");
  return [header, rule, ...body].join("\n");
}

export function formatContextLogReport(summary, options = {}) {
  const title = options.title ?? "UADI context log";
  const fileRows = summary.files_detail.map((file) => ({
    path: file.path,
    events: file.events,
    sections: file.sections.length,
    tokens: file.tokens_est.toLocaleString("en-US")
  }));
  const repeatedRows = summary.repeated_reads.map((entry) => ({
    path: entry.path,
    section: entry.section ?? "—",
    count: entry.count
  }));
  return [
    "# " + title,
    "",
    "Evidence tier: **" + summary.evidence_tier + "**",
    "",
    "This report is generated from read events, not written by the agent. Token totals are chars/4 estimates unless provider usage is joined separately.",
    "",
    "## Summary",
    "",
    "- Events: " + summary.events,
    "- Distinct files: " + summary.files,
    "- Distinct file/section pairs: " + summary.distinct_sections,
    "- Estimated tokens read: " + summary.total_tokens_est.toLocaleString("en-US"),
    "- Last turn: " + (summary.last_turn ?? "—"),
    "- Sources: " + Object.entries(summary.by_source).map(([source, count]) => source + "=" + count).join(", "),
    "",
    "## Files read",
    "",
    fileRows.length ? table(fileRows, [
      { label: "File", value: (row) => row.path },
      { label: "Reads", value: (row) => row.events },
      { label: "Sections", value: (row) => row.sections },
      { label: "Est. tokens", value: (row) => row.tokens }
    ]) : "No events.",
    "",
    "## Repeated reads",
    "",
    repeatedRows.length ? table(repeatedRows, [
      { label: "File", value: (row) => row.path },
      { label: "Section", value: (row) => row.section },
      { label: "Count", value: (row) => row.count }
    ]) : "No repeated file/section reads.",
    "",
    "## Limits",
    "",
    "- A read event proves that the wrapper or host recorded a read; it does not prove the model attended to every token.",
    "- Peak context occupancy is not inferred from cumulative reads.",
    "- Provider input/output/cached tokens and cost require provider usage metadata and are reported separately.",
    ""
  ].join("\n");
}

function parseArgs(args) {
  const options = { json: false, strict: false, checkPaths: false, root: ROOT, out: null, title: null };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--json") options.json = true;
    else if (arg === "--strict") options.strict = true;
    else if (arg === "--check-paths") options.checkPaths = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (["--log", "--root", "--out", "--title"].includes(arg)) {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error("Missing value for " + arg);
      options[arg.slice(2).replace(/-([a-z])/g, (_, character) => character.toUpperCase())] = value;
    } else throw new Error("Unknown option: " + arg);
  }
  if (!options.help && !options.log) throw new Error("--log is required");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/validate-context-log.mjs --log <events.jsonl> [--json] [--strict] [--check-paths] [--out <file>]");
    return;
  }
  const text = await readFile(path.resolve(options.log), "utf8");
  const parsed = parseContextLog(text);
  const validation = await validateContextLogWithPaths(parsed.events, { root: options.root, checkPaths: options.checkPaths });
  const summary = summarizeContextEvents(parsed.events);
  const report = { ...validation, summary, parse_errors: parsed.errors };

  if (parsed.errors.length || !validation.valid || (options.strict && validation.warnings.length)) {
    console.error(options.json ? JSON.stringify(report, null, 2) : [
      "FAIL " + options.log,
      ...parsed.errors,
      ...validation.errors,
      ...validation.warnings
    ].join("\n"));
    process.exitCode = 1;
    return;
  }

  const output = options.json ? JSON.stringify(report, null, 2) : formatContextLogReport(summary, { title: options.title ?? path.basename(options.log) });
  if (options.out) {
    const { writeFile, mkdir } = await import("node:fs/promises");
    await mkdir(path.dirname(path.resolve(options.out)), { recursive: true });
    await writeFile(path.resolve(options.out), output + "\n", "utf8");
  } else {
    console.log(output);
  }
  for (const warning of validation.warnings) console.error("WARN " + warning);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Context log validation failed: " + error.message);
    process.exitCode = 1;
  });
}
