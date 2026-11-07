#!/usr/bin/env node
// Deterministic quality gates for a built benchmark deliverable.
//
// Inner-loop tooling for the agent loop: minutes per run, no model calls.
// Static gates run anywhere; browser gates (axe violations, mobile
// overflow) reuse the React renderer's Playwright + axe-core installs when
// available and report themselves as skipped otherwise. Skipped gates never
// fail the run, but they also cannot be claimed as evidence.
//
// Usage:
//   node scripts/quality-gates.mjs --dir <run-dir> [--json] [--no-browser]
//       [--states default,loading,...] [--viewports 390x844,1280x900]
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const REQUIRED_STATES = ["default", "loading", "empty", "error", "success", "restricted"];
export const REQUIRED_VIEWPORTS = ["390x844", "1280x900"];

const SUCCESS_CLAIMS = [
  /payment (was )?succeeded/i,
  /saved successfully/i,
  /all (the )?checks passed/i,
  /all tests passed/i,
  /no errors (were )?found/i
];
const FAILURE_MARKERS = /\b(fail|failed|failure|error:|✗|✘)\b/i;

function gate(id, status, details = {}, reason) {
  return { id, status, ...(reason ? { reason } : {}), ...details };
}

async function exists(file) {
  return Boolean(await stat(file).catch(() => null));
}

function attrsToMap(attrText) {
  const map = {};
  for (const match of attrText.matchAll(/([a-zA-Z-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    map[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return map;
}

function stripTags(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Conservative static accessible-name analysis: labelled via aria-label,
// aria-labelledby, an associated <label>, text content (button/link), or a
// placeholder (inputs only, weakest signal). This is a heuristic, not a
// substitute for the browser axe gate.
export function unnamedControls(html) {
  const violations = [];
  const labelFors = new Set([...html.matchAll(/<label[^>]*\bfor="([^"]+)"/g)].map((m) => m[1]));
  const ids = new Map();
  for (const match of html.matchAll(/<([a-zA-Z][\w-]*)[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) {
    ids.set(match[2], stripTags(match[3]));
  }
  for (const match of html.matchAll(/<(button|a|input|select|textarea)\b([^>]*)>?([\s\S]*?)(?:<\/\1>)/g)) {
    const [whole, tag, attrText, inner] = match;
    if (tag === "input" && /\btype\s*=\s*"(hidden|submit|image)"/i.test(attrText)) continue;
    const attrs = attrsToMap(attrText);
    let name = attrs["aria-label"] ?? "";
    if (!name && attrs["aria-labelledby"]) {
      name = attrs["aria-labelledby"].split(/\s+/).map((id) => ids.get(id) ?? "").join(" ").trim();
    }
    if (!name && attrs.id && labelFors.has(attrs.id)) name = "(associated label)";
    if (!name && (tag === "button" || tag === "a")) name = stripTags(inner);
    if (!name && tag === "input") name = attrs.placeholder ?? attrs.title ?? "";
    if (!name && tag === "select") name = attrs.title ?? "";
    if (!name) violations.push({ tag, label: attrs["aria-label"] ?? attrs.id ?? "(no label)", snippet: whole.slice(0, 80) });
  }
  // Void <input ...> without a closing tag never matched above; scan them directly.
  for (const match of html.matchAll(/<input\b([^>]*?)>/g)) {
    const attrs = attrsToMap(match[1]);
    if (/^(hidden|submit|image)$/i.test(attrs.type ?? "")) continue;
    const labelled = attrs["aria-label"] || (attrs.id && labelFors.has(attrs.id)) ||
      attrs.placeholder || attrs.title || "";
    if (!labelled && !violations.some((v) => v.snippet === match[0].slice(0, 80))) {
      violations.push({ tag: "input", label: attrs.id ?? "(no label)", snippet: match[0].slice(0, 80) });
    }
  }
  return violations;
}

async function findDeliverable(dir) {
  for (const sub of ["", "project"]) {
    const html = path.join(dir, sub, "index.html");
    if (await exists(html)) return { deliverableDir: path.join(dir, sub), indexHtml: html };
  }
  return null;
}

async function listFilesRecursive(dir, prefix = "") {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    const rel = prefix ? prefix + "/" + entry.name : entry.name;
    if (entry.isDirectory()) out.push(...(await listFilesRecursive(path.join(dir, entry.name), rel)));
    else if (entry.isFile()) out.push(rel);
  }
  return out;
}

export async function runQualityGates(dir, options = {}) {
  const requiredStates = options.states ?? REQUIRED_STATES;
  const requiredViewports = options.viewports ?? REQUIRED_VIEWPORTS;
  const enableBrowser = options.enableBrowser !== false;
  const absolute = path.resolve(dir);
  const found = await findDeliverable(absolute);
  if (!found) {
    return {
      dir: absolute,
      ok: false,
      gates: [gate("deliverable", "fail", {}, "no index.html found in " + absolute + " or its project/ subdirectory")]
    };
  }
  const gates = [];
  const html = await readFile(found.indexHtml, "utf8");

  const controls = unnamedControls(html);
  gates.push(controls.length === 0
    ? gate("accessible-names", "pass", { violations: 0 })
    : gate("accessible-names", "fail", { violations: controls.length, details: controls.slice(0, 10) }));

  const evidenceDir = (await exists(path.join(absolute, "evidence")))
    ? path.join(absolute, "evidence")
    : (await exists(path.join(found.deliverableDir, "evidence")) ? path.join(found.deliverableDir, "evidence") : null);
  const screenshotsDir = evidenceDir ? path.join(evidenceDir, "screenshots") : null;
  const screenshotNames = screenshotsDir ? (await readdir(screenshotsDir).catch(() => [])) : [];

  const missingViewports = requiredViewports.filter((viewport) => !screenshotNames.some((name) => name.includes(viewport)));
  if (!evidenceDir || !screenshotsDir) {
    gates.push(gate("viewport-evidence", "fail", { missing_viewports: requiredViewports }, "no evidence/screenshots directory found"));
  } else if (missingViewports.length > 0) {
    gates.push(gate("viewport-evidence", "fail", { missing_viewports: missingViewports }));
  } else {
    gates.push(gate("viewport-evidence", "pass", { screenshots: screenshotNames.length }));
  }

  const sourceFiles = await listFilesRecursive(found.deliverableDir);
  const sourceText = (await Promise.all(
    sourceFiles.filter((name) => /\.(html|js|css|jsx|tsx|ts)$/i.test(name)).map((name) => readFile(path.join(found.deliverableDir, name), "utf8").catch(() => ""))
  )).join("\n").toLowerCase();
  const missingStates = requiredStates.filter((state) =>
    !screenshotNames.some((name) => name.toLowerCase().includes(state)) && !sourceText.includes(state));
  gates.push(missingStates.length === 0
    ? gate("required-states", "pass", { states: requiredStates.length })
    : gate("required-states", "fail", { missing_states: missingStates }));

  // Claim-behavior cross-check: analysis.md claims must have evidence.
  const analysisPath = path.join(absolute, "analysis.md");
  if (!(await exists(analysisPath))) {
    gates.push(gate("claim-behavior", "skipped", {}, "no analysis.md present"));
  } else {
    const analysis = await readFile(analysisPath, "utf8");
    const problems = [];
    for (const match of analysis.matchAll(/evidence\/[\w./-]+/g)) {
      const rel = match[0];
      if (!(await exists(path.join(absolute, rel))) && !(await exists(path.join(found.deliverableDir, rel)))) {
        problems.push("analysis.md references " + rel + " but it does not exist");
      }
    }
    const successClaims = SUCCESS_CLAIMS.filter((pattern) => pattern.test(analysis));
    if (successClaims.length > 0) {
      const testOutputDir = evidenceDir ? path.join(evidenceDir, "test-output") : null;
      const outputs = testOutputDir ? await listFilesRecursive(testOutputDir).catch(() => []) : [];
      const outputText = (await Promise.all(outputs.map((name) => readFile(path.join(testOutputDir, name), "utf8").catch(() => "")))).join("\n");
      if (outputs.length === 0) {
        problems.push("analysis.md claims success but evidence/test-output is missing or empty");
      } else if (FAILURE_MARKERS.test(outputText)) {
        problems.push("analysis.md claims success but evidence/test-output contains failure markers");
      }
    }
    gates.push(problems.length === 0
      ? gate("claim-behavior", "pass", { success_claims_checked: successClaims.length })
      : gate("claim-behavior", "fail", { problems }));
  }

  if (!enableBrowser) {
    gates.push(gate("axe", "skipped", {}, "browser gates disabled"));
    gates.push(gate("mobile-overflow", "skipped", {}, "browser gates disabled"));
  } else {
    gates.push(...(await runBrowserGates(found.indexHtml)));
  }

  return { dir: absolute, ok: gates.every((g) => g.status !== "fail"), gates };
}

async function runBrowserGates(indexHtml) {
  let chromium;
  let axeSource;
  try {
    const rendererRoot = path.join(ROOT, "renderers/react");
    const require = createRequire(path.join(rendererRoot, "package.json"));
    ({ chromium } = require("@playwright/test"));
    axeSource = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
  } catch (error) {
    return [
      gate("axe", "skipped", {}, "browser environment unavailable: " + error.message),
      gate("mobile-overflow", "skipped", {}, "browser environment unavailable: " + error.message)
    ];
  }
  let browser;
  try {
    browser = await chromium.launch();
  } catch (error) {
    return [
      gate("axe", "skipped", {}, "chromium unavailable: " + error.message),
      gate("mobile-overflow", "skipped", {}, "chromium unavailable: " + error.message)
    ];
  }
  const url = "file://" + indexHtml;
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(url, { waitUntil: "load" });
    await page.addScriptTag({ content: axeSource });
    const raw = await page.evaluate(() => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] } }));
    const seen = new Set();
    const violations = [];
    for (const violation of raw.violations) {
      if (!["critical", "serious"].includes(violation.impact)) continue;
      for (const node of violation.nodes) {
        const key = violation.id + "::" + node.target.join(",");
        if (seen.has(key)) continue;
        seen.add(key);
        violations.push({ id: violation.id, impact: violation.impact, target: node.target.join(" ") });
      }
    }
    await page.close();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobile.goto(url, { waitUntil: "load" });
    const overflowPixels = await mobile.evaluate(() =>
      Math.max(document.scrollingElement.scrollWidth, document.body.scrollWidth) - window.innerWidth);
    await mobile.close();

    return [
      violations.length === 0
        ? gate("axe", "pass", { critical_or_serious: 0 })
        : gate("axe", "fail", { critical_or_serious: violations.length, details: violations.slice(0, 10) }),
      overflowPixels <= 1
        ? gate("mobile-overflow", "pass", { overflow_pixels: 0 })
        : gate("mobile-overflow", "fail", { overflow_pixels: overflowPixels })
    ];
  } catch (error) {
    return [
      gate("axe", "skipped", {}, "browser run failed: " + error.message),
      gate("mobile-overflow", "skipped", {}, "browser run failed: " + error.message)
    ];
  } finally {
    await browser.close().catch(() => {});
  }
}

function parseArgs(args) {
  const options = { json: false, enableBrowser: true, states: [...REQUIRED_STATES], viewports: [...REQUIRED_VIEWPORTS] };
  for (let i = 0; i < args.length; i += 1) {
    const flag = args[i];
    if (flag === "--dir") options.dir = args[++i];
    else if (flag === "--json") options.json = true;
    else if (flag === "--no-browser") options.enableBrowser = false;
    else if (flag === "--states") options.states = args[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (flag === "--viewports") options.viewports = args[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else throw new Error("Unknown option: " + flag);
  }
  if (!options.dir) throw new Error("Required option missing: --dir");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const result = await runQualityGates(options.dir, options);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log((result.ok ? "PASS " : "FAIL ") + result.dir);
    for (const g of result.gates) {
      console.log("  " + g.status.toUpperCase().padEnd(7) + " " + g.id +
        (g.reason ? " — " + g.reason : "") +
        (g.details ? " " + JSON.stringify(g.details) : "") +
        (g.missing_states ? " missing: " + g.missing_states.join(", ") : "") +
        (g.missing_viewports ? " missing: " + g.missing_viewports.join(", ") : "") +
        (g.problems ? " " + g.problems.join("; ") : ""));
    }
  }
  process.exitCode = result.ok ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Quality gates failed: " + error.message);
    process.exitCode = 1;
  });
}
