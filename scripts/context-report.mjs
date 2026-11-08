#!/usr/bin/env node
// Static context audit for the UADI skill.
//
// This reports what is shipped and what a given reading profile would load.
// It does NOT report what an agent actually read; use the context log
// instrumentation for that. Token numbers are chars/4 estimates and are
// labelled as such everywhere they appear.
//
// Usage:
//   node scripts/context-report.mjs [--json] [--check] [--profile <name>]
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SKILL_FILES, SKILL_PROFILES } from "./install-skill.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const TOKEN_ESTIMATE_METHOD = "chars/4 (estimate, not tokenizer output)";

// Budgets are audit tripwires, not release gates yet. They describe the
// current baseline and the direction of travel for the v0.2 runtime.
export const CONTEXT_BUDGETS = {
  kernel: 700,
  runtime: 6500,
  runtime_risk: 8500,
  core: 1000,
  always: 2300,
  typical: 16000,
  deep: 22000,
  example: 25000,
  installed: 100000
};

const PLAYBOOKS = [
  "intelligence/PRODUCT-UNDERSTANDING-PLAYBOOK.md",
  "intelligence/UX-REASONING-PLAYBOOK.md",
  "intelligence/DESIGN-DECISIONS-PLAYBOOK.md",
  "intelligence/VISUAL-DESIGN-PLAYBOOK.md"
];

const MODULES = [
  "intelligence/modules/product-context.md",
  "intelligence/modules/flow-and-states.md",
  "intelligence/modules/content-and-consequences.md",
  "intelligence/modules/visual-composition.md",
  "intelligence/modules/alternatives-and-tradeoffs.md",
  "intelligence/modules/accessibility-review.md"
];

const RISK_CARDS = [
  "intelligence/risks/billing-changes.md",
  "intelligence/risks/permissions-and-destructive.md",
  "intelligence/risks/data-freshness.md",
  "intelligence/risks/health-and-claims.md",
  "intelligence/risks/ownership-handover.md"
];

const ALWAYS = ["SKILL.md", "docs/DESIGN-INTELLIGENCE.md"];
const DEEP_EXTRAS = [
  "docs/ACCESSIBILITY-AND-INTERACTION-REVIEW.md",
  "docs/QUALITY-GATES.md",
  "intelligence/patterns/metrics-and-data-visualization.md"
];

export const LOAD_PROFILES = {
  kernel: ["SKILL.md"],
  runtime: ["SKILL.md", ...MODULES],
  runtime_risk: ["SKILL.md", ...MODULES, ...RISK_CARDS],
  always: ALWAYS,
  typical: [...ALWAYS, ...PLAYBOOKS],
  deep: [...ALWAYS, ...PLAYBOOKS, ...DEEP_EXTRAS],
  example: [...ALWAYS, ...PLAYBOOKS, ...DEEP_EXTRAS, "examples/operations-dashboard/README.md"],
  installed: [...SKILL_FILES]
};

export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

export function classifyPath(file) {
  if (file === "SKILL.md") return "kernel";
  if (file === "docs/DESIGN-INTELLIGENCE.md") return "core";
  if (file.startsWith("intelligence/patterns/")) return "pattern";
  if (file.startsWith("intelligence/modules/")) return "module";
  if (file.startsWith("intelligence/risks/")) return "risk";
  if (file.startsWith("intelligence/") && file.endsWith("PLAYBOOK.md")) return "reference";
  if (file.startsWith("examples/")) return "example";
  if (file.startsWith("schemas/") || file.startsWith("component-catalog/")) return "contract";
  if (file.startsWith("docs/")) return "reference";
  return "other";
}

async function readEntry(root, file) {
  const absolute = path.join(root, file);
  const [text, info] = await Promise.all([readFile(absolute, "utf8"), stat(absolute)]);
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return {
    path: file,
    layer: classifyPath(file),
    bytes: info.size,
    chars: text.length,
    words,
    tokens_est: estimateTokens(text)
  };
}

function sumProfile(entries, files) {
  const byPath = new Map(entries.map((entry) => [entry.path, entry]));
  const selected = files.filter((file, index) => files.indexOf(file) === index);
  const missing = selected.filter((file) => !byPath.has(file));
  const tokens = selected.reduce((total, file) => total + (byPath.get(file)?.tokens_est ?? 0), 0);
  return { files: selected, count: selected.length, tokens_est: tokens, missing };
}

export async function buildContextReport(root = ROOT) {
  const entries = [];
  const missing = [];
  const allFiles = [...new Set([...SKILL_FILES, ...Object.values(SKILL_PROFILES).flat()])].sort();
  for (const file of allFiles) {
    try {
      entries.push(await readEntry(root, file));
    } catch (error) {
      if (error.code === "ENOENT") missing.push(file);
      else throw error;
    }
  }

  const profiles = {};
  const budgets = {};
  for (const [name, files] of Object.entries(LOAD_PROFILES)) {
    const summary = sumProfile(entries, files);
    const budget = CONTEXT_BUDGETS[name] ?? null;
    profiles[name] = {
      ...summary,
      budget,
      over_budget: budget !== null && summary.tokens_est > budget,
      over_by: budget !== null ? Math.max(0, summary.tokens_est - budget) : 0
    };
    budgets[name] = { budget, actual: summary.tokens_est, over_budget: profiles[name].over_budget };
  }

  const kernel = entries.find((entry) => entry.path === "SKILL.md") ?? null;
  const core = entries.find((entry) => entry.path === "docs/DESIGN-INTELLIGENCE.md") ?? null;
  const modules = entries.filter((entry) => entry.layer === "module").sort((a, b) => b.tokens_est - a.tokens_est);

  budgets.kernel = {
    budget: CONTEXT_BUDGETS.kernel,
    actual: kernel?.tokens_est ?? 0,
    over_budget: (kernel?.tokens_est ?? 0) > CONTEXT_BUDGETS.kernel
  };
  budgets.core = {
    budget: CONTEXT_BUDGETS.core,
    actual: core?.tokens_est ?? 0,
    over_budget: (core?.tokens_est ?? 0) > CONTEXT_BUDGETS.core
  };

  const installProfiles = {};
  for (const [name, files] of Object.entries(SKILL_PROFILES)) {
    installProfiles[name] = sumProfile(entries, files);
  }

  return {
    root,
    estimate_method: TOKEN_ESTIMATE_METHOD,
    generated_at: new Date().toISOString(),
    inventory: entries,
    missing,
    totals: {
      files: entries.length,
      bytes: entries.reduce((total, entry) => total + entry.bytes, 0),
      words: entries.reduce((total, entry) => total + entry.words, 0),
      tokens_est: entries.reduce((total, entry) => total + entry.tokens_est, 0)
    },
    kernel,
    core,
    modules,
    profiles,
    install_profiles: installProfiles,
    budgets,
    largest: [...entries].sort((a, b) => b.tokens_est - a.tokens_est).slice(0, 12)
  };
}

function table(rows, columns) {
  const header = "| " + columns.map((column) => column.label).join(" | ") + " |";
  const rule = "| " + columns.map(() => "---").join(" | ") + " |";
  const body = rows.map((row) => "| " + columns.map((column) => String(column.value(row))).join(" | ") + " |");
  return [header, rule, ...body].join("\n");
}

export function formatContextReport(report) {
  const profileRows = Object.entries(report.profiles).map(([name, profile]) => ({
    name,
    files: profile.count,
    tokens: profile.tokens_est.toLocaleString("en-US"),
    budget: profile.budget === null ? "—" : profile.budget.toLocaleString("en-US"),
    status: profile.over_budget ? "over by " + profile.over_by.toLocaleString("en-US") : "within"
  }));
  const moduleRows = report.modules.map((entry) => ({
    path: entry.path.replace("intelligence/", ""),
    tokens: entry.tokens_est.toLocaleString("en-US")
  }));
  const riskRows = report.inventory.filter((entry) => entry.layer === "risk").map((entry) => ({
    path: entry.path.replace("intelligence/", ""),
    tokens: entry.tokens_est.toLocaleString("en-US")
  }));
  const installRows = Object.entries(report.install_profiles ?? {}).map(([name, profile]) => ({
    name,
    files: profile.count,
    tokens: profile.tokens_est.toLocaleString("en-US")
  }));
  const largestRows = report.largest.map((entry) => ({
    path: entry.path,
    layer: entry.layer,
    tokens: entry.tokens_est.toLocaleString("en-US")
  }));

  return [
    "# UADI context report (static audit)",
    "",
    "Generated: " + report.generated_at,
    "",
    "**Token method:** " + report.estimate_method + ". Installed files are not the same as loaded context.",
    "",
    "## Load profiles",
    "",
    table(profileRows, [
      { label: "Profile", value: (row) => row.name },
      { label: "Files", value: (row) => row.files },
      { label: "Est. tokens", value: (row) => row.tokens },
      { label: "Budget", value: (row) => row.budget },
      { label: "Status", value: (row) => row.status }
    ]),
    "",
    "## Always-on baseline",
    "",
    "- Kernel (`SKILL.md`): " + (report.kernel?.tokens_est ?? 0).toLocaleString("en-US") + " est. tokens",
    "- Core (`docs/DESIGN-INTELLIGENCE.md`): " + (report.core?.tokens_est ?? 0).toLocaleString("en-US") + " est. tokens",
    "- Always profile (kernel + core): " + report.profiles.always.tokens_est.toLocaleString("en-US") + " est. tokens",
    "- Runtime profile (kernel + six modules): " + (report.profiles.runtime?.tokens_est ?? 0).toLocaleString("en-US") + " est. tokens",
    "",
    "## Runtime modules",
    "",
    table(moduleRows, [
      { label: "File", value: (row) => row.path },
      { label: "Est. tokens", value: (row) => row.tokens }
    ]),
    "",
    "## Risk cards",
    "",
    table(riskRows, [
      { label: "File", value: (row) => row.path },
      { label: "Est. tokens", value: (row) => row.tokens }
    ]),
    "",
    "## Largest shipped files",
    "",
    table(largestRows, [
      { label: "File", value: (row) => row.path },
      { label: "Layer", value: (row) => row.layer },
      { label: "Est. tokens", value: (row) => row.tokens }
    ]),
    "",
    "## Installation profiles",
    "",
    table(installRows, [
      { label: "Profile", value: (row) => row.name },
      { label: "Files", value: (row) => row.files },
      { label: "Shipped est. tokens", value: (row) => row.tokens }
    ]),
    "",
    "## Installation footprint (all profile files)",
    "",
    "- Files: " + report.totals.files,
    "- Bytes: " + report.totals.bytes.toLocaleString("en-US"),
    "- Words: " + report.totals.words.toLocaleString("en-US"),
    "- Estimated tokens if every installed file were read: " + report.totals.tokens_est.toLocaleString("en-US"),
    report.missing.length ? "- Missing files: " + report.missing.join(", ") : "- Missing files: none",
    "",
    "## Limits",
    "",
    "- These are file-size estimates, not measured context consumption.",
    "- `kernel`, `runtime` and `runtime_risk` model the progressive runtime.",
    "- `typical` models the legacy instruction path (kernel + core + four playbooks).",
    "- `deep` adds accessibility, quality gates and one representative pattern.",
    "- `example` adds one worked-example README; it does not include example source files.",
    "- Actual reads, repeated reads, provider tokens and cost are measured by the context log.",
    ""
  ].join("\n");
}

function parseArgs(args) {
  const options = { json: false, check: false, profile: null, root: ROOT };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--json") options.json = true;
    else if (arg === "--check") options.check = true;
    else if (arg === "--profile" || arg === "--root") {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error("Missing value for " + arg);
      options[arg.slice(2)] = value;
    } else if (arg === "--help" || arg === "-h") options.help = true;
    else throw new Error("Unknown option: " + arg);
  }
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log("Usage: node scripts/context-report.mjs [--json] [--check] [--profile <name>] [--root <dir>]");
    return;
  }
  const report = await buildContextReport(path.resolve(options.root));
  if (options.profile) {
    const profile = report.profiles[options.profile];
    if (!profile) throw new Error("Unknown profile: " + options.profile + " (available: " + Object.keys(report.profiles).join(", ") + ")");
    console.log(options.json ? JSON.stringify(profile, null, 2) : formatContextReport(report));
    return;
  }
  console.log(options.json ? JSON.stringify(report, null, 2) : formatContextReport(report));
  if (options.check) {
    const over = Object.entries(report.budgets).filter(([, value]) => value.over_budget);
    if (over.length > 0) {
      console.error("\nContext budgets exceeded: " + over.map(([name, value]) => name + " (" + value.actual + " > " + value.budget + ")").join(", "));
      process.exitCode = 1;
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Context report failed: " + error.message);
    process.exitCode = 1;
  });
}
