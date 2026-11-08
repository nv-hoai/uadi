#!/usr/bin/env node
// Project-level design memory: validate, resolve and render a compact brief.
//
// The JSON file is the source of record. The Markdown brief is derived and is
// what an agent should read at the start of a task. No backend or database.
//
// Usage:
//   node scripts/design-memory.mjs init --file .uadi/design-memory.json --project-id my-product
//   node scripts/design-memory.mjs validate --file .uadi/design-memory.json
//   node scripts/design-memory.mjs brief --file .uadi/design-memory.json --out .uadi/DESIGN-MEMORY.md
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const MEMORY_KINDS = ["CONSTRAINT", "DECISION", "REJECTED_DIRECTION", "OPEN_QUESTION", "PREFERENCE", "EVIDENCE"];
export const MEMORY_STATUSES = ["PROPOSED", "APPROVED", "SUPERSEDED", "EXPIRED"];
export const MEMORY_SOURCES = ["OWNER", "REPO", "EXTERNAL", "INFERRED"];
export const MEMORY_LEVELS = ["PROJECT", "FEATURE", "COMPONENT"];

function isDate(value) {
  return typeof value === "string" && value.includes("T") && !Number.isNaN(Date.parse(value));
}

function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function checkStringArray(value, where, errors, { optional = true } = {}) {
  if (value === undefined && optional) return;
  if (!Array.isArray(value) || value.some((item) => !isNonEmpty(item))) {
    errors.push(where + " must be an array of non-empty strings");
  }
}

export function validateMemory(memory) {
  const errors = [];
  const warnings = [];
  if (!memory || typeof memory !== "object" || Array.isArray(memory)) {
    return { valid: false, errors: ["memory must be an object"], warnings };
  }
  if (memory.schema_version !== "1.0.0") errors.push("schema_version must be 1.0.0");
  if (!isNonEmpty(memory.project_id)) errors.push("project_id must be a non-empty string");
  if (!isDate(memory.updated_at)) errors.push("updated_at must be an ISO date-time");
  if (!Array.isArray(memory.entries)) {
    errors.push("entries must be an array");
    return { valid: false, errors, warnings };
  }
  if (memory.entries.length > 200) warnings.push("entries exceeds 200; compact superseded and expired entries");

  const ids = new Set();
  for (const [index, entry] of memory.entries.entries()) {
    const where = "entries[" + index + "]";
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(where + " must be an object");
      continue;
    }
    if (!isNonEmpty(entry.id)) errors.push(where + ".id must be a non-empty string");
    else if (ids.has(entry.id)) errors.push(where + ".id is duplicated: " + entry.id);
    else ids.add(entry.id);
    if (!MEMORY_KINDS.includes(entry.kind)) errors.push(where + ".kind must be one of " + MEMORY_KINDS.join(", "));
    if (!entry.scope || typeof entry.scope !== "object" || Array.isArray(entry.scope)) {
      errors.push(where + ".scope must be an object");
    } else {
      if (!MEMORY_LEVELS.includes(entry.scope.level)) errors.push(where + ".scope.level must be one of " + MEMORY_LEVELS.join(", "));
      if (entry.scope.ref !== undefined && !isNonEmpty(entry.scope.ref)) errors.push(where + ".scope.ref must be a non-empty string");
    }
    if (!isNonEmpty(entry.statement)) errors.push(where + ".statement must be a non-empty string");
    if (entry.rationale !== undefined && typeof entry.rationale !== "string") errors.push(where + ".rationale must be a string");
    if (!MEMORY_STATUSES.includes(entry.status)) errors.push(where + ".status must be one of " + MEMORY_STATUSES.join(", "));
    if (!entry.provenance || typeof entry.provenance !== "object" || Array.isArray(entry.provenance)) {
      errors.push(where + ".provenance must be an object");
    } else {
      if (!MEMORY_SOURCES.includes(entry.provenance.source)) errors.push(where + ".provenance.source must be one of " + MEMORY_SOURCES.join(", "));
      if (entry.provenance.ref !== undefined && typeof entry.provenance.ref !== "string") errors.push(where + ".provenance.ref must be a string");
      if (entry.provenance.observed_at !== undefined && !isDate(entry.provenance.observed_at)) errors.push(where + ".provenance.observed_at must be an ISO date-time");
      if (entry.provenance.confidence !== undefined && (typeof entry.provenance.confidence !== "number" || entry.provenance.confidence < 0 || entry.provenance.confidence > 1)) {
        errors.push(where + ".provenance.confidence must be between 0 and 1");
      }
    }
    if (entry.status === "APPROVED") {
      if (!isNonEmpty(entry.approved_by)) errors.push(where + ".approved_by is required for APPROVED entries");
      if (!isDate(entry.approved_at)) errors.push(where + ".approved_at is required for APPROVED entries");
    }
    if (entry.approved_at !== undefined && !isDate(entry.approved_at)) errors.push(where + ".approved_at must be an ISO date-time");
    if (entry.effective_at !== undefined && !isDate(entry.effective_at)) errors.push(where + ".effective_at must be an ISO date-time");
    if (entry.review_after !== undefined && !isDate(entry.review_after)) errors.push(where + ".review_after must be an ISO date-time");
    checkStringArray(entry.supersedes, where + ".supersedes", errors);
    checkStringArray(entry.related, where + ".related", errors);
    checkStringArray(entry.tags, where + ".tags", errors);
    if (Array.isArray(entry.supersedes) && entry.supersedes.includes(entry.id)) errors.push(where + ".supersedes cannot include itself");
  }

  for (const [index, entry] of memory.entries.entries()) {
    if (!Array.isArray(entry?.supersedes)) continue;
    for (const target of entry.supersedes) {
      if (!ids.has(target)) warnings.push("entries[" + index + "].supersedes references unknown id: " + target);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function resolveMemory(memory, now = new Date()) {
  const entries = Array.isArray(memory?.entries) ? memory.entries : [];
  const approvedIds = new Set(entries.filter((entry) => entry.status === "APPROVED").map((entry) => entry.id));
  const supersededBy = new Map();
  for (const entry of entries) {
    if (entry.status !== "APPROVED") continue;
    for (const target of entry.supersedes ?? []) {
      if (approvedIds.has(target)) supersededBy.set(target, entry.id);
    }
  }
  const nowMs = now.getTime();
  const approved = [];
  const proposed = [];
  const superseded = [];
  const expired = [];
  const stale = [];
  for (const entry of entries) {
    if (entry.status === "PROPOSED") proposed.push(entry);
    else if (entry.status === "EXPIRED") expired.push(entry);
    else if (entry.status === "SUPERSEDED" || supersededBy.has(entry.id)) superseded.push({ ...entry, superseded_by: supersededBy.get(entry.id) ?? null });
    else if (entry.status === "APPROVED") {
      approved.push(entry);
      if (entry.review_after && Date.parse(entry.review_after) < nowMs) stale.push(entry);
    }
  }
  return { approved, proposed, superseded, expired, stale, superseded_by: Object.fromEntries(supersededBy) };
}

function truncate(text, max = 240) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

const SECTION_TITLES = {
  CONSTRAINT: "Constraints",
  DECISION: "Decisions",
  REJECTED_DIRECTION: "Rejected directions",
  OPEN_QUESTION: "Open questions",
  PREFERENCE: "Preferences",
  EVIDENCE: "Evidence"
};

export function buildMemoryBrief(memory, options = {}) {
  const validation = validateMemory(memory);
  if (!validation.valid) throw new Error("Cannot build a brief from invalid memory: " + validation.errors.join("; "));
  const now = options.now ?? new Date();
  const maxEntries = options.maxEntries ?? 20;
  const resolved = resolveMemory(memory, now);
  const visible = resolved.approved.slice(0, maxEntries);
  const lines = [
    "# Design memory — " + memory.project_id,
    "",
    "Updated: " + memory.updated_at + " · Active approved entries: " + resolved.approved.length + (resolved.approved.length > visible.length ? " (showing " + visible.length + ")" : ""),
    "",
    "Approved entries are constraints. Proposed entries are hypotheses, not requirements. Superseded and expired entries are excluded.",
    ""
  ];
  let shown = 0;
  for (const kind of MEMORY_KINDS) {
    const entries = visible.filter((entry) => entry.kind === kind);
    if (entries.length === 0) continue;
    lines.push("## " + SECTION_TITLES[kind], "");
    for (const entry of entries) {
      shown += 1;
      const scope = entry.scope.level === "PROJECT" ? "" : " [" + entry.scope.level + (entry.scope.ref ? ": " + entry.scope.ref : "") + "]";
      const rationale = entry.rationale ? " — " + truncate(entry.rationale) : "";
      const source = entry.provenance?.ref ? " (" + entry.provenance.source + ": " + truncate(entry.provenance.ref, 80) + ")" : " (" + entry.provenance?.source + ")";
      lines.push("- **" + entry.id + "**" + scope + " " + truncate(entry.statement) + rationale + source);
    }
    lines.push("");
  }
  if (shown === 0) lines.push("_No approved entries yet._", "");
  if (resolved.proposed.length > 0) {
    lines.push("## Proposed — not constraints", "");
    for (const entry of resolved.proposed.slice(0, 5)) {
      lines.push("- **" + entry.id + "** " + truncate(entry.statement));
    }
    if (resolved.proposed.length > 5) lines.push("- …and " + (resolved.proposed.length - 5) + " more proposed entries.");
    lines.push("");
  }
  if (resolved.stale.length > 0) {
    lines.push("## Needs review", "");
    for (const entry of resolved.stale.slice(0, 10)) {
      lines.push("- **" + entry.id + "** review_after " + entry.review_after + " — " + truncate(entry.statement, 120));
    }
    lines.push("");
  }
  lines.push("_Generated from `design-memory.json`; do not edit this brief by hand._", "");
  return lines.join("\n");
}

export function createMemory(projectId, now = new Date()) {
  return {
    schema_version: "1.0.0",
    project_id: projectId,
    updated_at: now.toISOString(),
    entries: []
  };
}

function parseArgs(args) {
  const options = { file: null, projectId: null, out: null, json: false, force: false, maxEntries: 20 };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--json") options.json = true;
    else if (arg === "--force") options.force = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (["--file", "--project-id", "--out", "--max-entries"].includes(arg)) {
      const value = args[++index];
      if (value === undefined || value.startsWith("--")) throw new Error("Missing value for " + arg);
      if (arg === "--project-id") options.projectId = value;
      else if (arg === "--max-entries") options.maxEntries = Number(value);
      else options[arg.slice(2)] = value;
    } else throw new Error("Unknown option: " + arg);
  }
  return options;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = parseArgs(args.slice(1));
  if (options.help || !command) {
    console.log("Usage: node scripts/design-memory.mjs <init|validate|brief> --file <path> [--project-id <id>] [--out <path>] [--json]");
    return;
  }
  if (!options.file) throw new Error("--file is required");
  const file = path.resolve(options.file);

  if (command === "init") {
    if (!options.force) {
      try {
        await readFile(file, "utf8");
        throw new Error("Memory already exists: " + file + " (use --force to replace)");
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    const projectId = options.projectId ?? path.basename(process.cwd());
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(createMemory(projectId), null, 2) + "\n", "utf8");
    console.log("Created " + file);
    return;
  }

  if (command === "validate") {
    const memory = JSON.parse(await readFile(file, "utf8"));
    const result = validateMemory(memory);
    if (options.json) console.log(JSON.stringify(result, null, 2));
    else {
      console.log((result.valid ? "PASS " : "FAIL ") + file);
      for (const error of result.errors) console.error("  ERROR " + error);
      for (const warning of result.warnings) console.error("  WARN  " + warning);
    }
    if (!result.valid) process.exitCode = 1;
    return;
  }

  if (command === "brief") {
    const memory = JSON.parse(await readFile(file, "utf8"));
    const brief = buildMemoryBrief(memory, { maxEntries: options.maxEntries });
    if (options.out) {
      await mkdir(path.dirname(path.resolve(options.out)), { recursive: true });
      await writeFile(path.resolve(options.out), brief, "utf8");
      console.log("Wrote " + options.out);
    } else {
      console.log(brief);
    }
    return;
  }

  throw new Error("Unknown command: " + command);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Design memory failed: " + error.message);
    process.exitCode = 1;
  });
}
