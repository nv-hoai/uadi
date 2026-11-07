#!/usr/bin/env node
// Deterministic evidence capture for benchmark deliverables.
//
// Agents keep inventing screenshot code and naming conventions, and the
// quality gates then fail or misread the evidence. This script is the one
// supported way to capture screenshots: fixed viewport names, canonical
// file names (<viewport>-<state>.png), and an honest report of which
// states it could actually activate on the page.
//
// Usage:
//   node scripts/capture-evidence.mjs --dir <project-dir> --out <evidence/screenshots>
//       [--states default,loading,...] [--viewports 390x844,1280x900] [--json]
//
// State activation is best-effort: URL hash (#state=<name>), then a
// <select> or <button> whose text matches the state. A screenshot of a
// state that could not be activated is still written (so the gap is
// visible) but is reported with activated:false and exit code 1.
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_STATES = ["default", "loading", "empty", "error", "success", "restricted"];
export const DEFAULT_VIEWPORTS = ["390x844", "1280x900"];

function parseViewport(viewport) {
  const match = /^(\d+)x(\d+)$/.exec(viewport);
  if (!match) throw new Error("Invalid viewport: " + viewport + " (expected e.g. 390x844)");
  return { width: Number(match[1]), height: Number(match[2]) };
}

export async function findIndexHtml(dir) {
  for (const sub of ["", "project"]) {
    const candidate = path.join(dir, sub, "index.html");
    if (await stat(candidate).catch(() => null)) return candidate;
  }
  throw new Error("No index.html found in " + dir + " or its project/ subdirectory");
}

export function captureSummary(captures) {
  return {
    captures,
    activated: captures.filter((c) => c.activated).length,
    total: captures.length,
    all_activated: captures.every((c) => c.activated)
  };
}

export async function captureEvidence(indexHtml, options = {}) {
  const states = options.states ?? DEFAULT_STATES;
  const viewports = options.viewports ?? DEFAULT_VIEWPORTS;
  const outDir = path.resolve(options.out);

  const rendererRoot = path.join(ROOT, "renderers/react");
  const require = createRequire(path.join(rendererRoot, "package.json"));
  let chromium;
  try {
    ({ chromium } = require("@playwright/test"));
  } catch (error) {
    throw new Error("Browser environment unavailable (install renderers/react dependencies): " + error.message);
  }

  await mkdir(outDir, { recursive: true });
  const url = "file://" + indexHtml;
  const browser = await chromium.launch().catch((error) => {
    throw new Error("chromium unavailable: " + error.message);
  });
  const captures = [];
  try {
    for (const viewport of viewports) {
      const { width, height } = parseViewport(viewport);
      for (const state of states) {
        const page = await browser.newPage({ viewport: { width, height } });
        await page.goto(url, { waitUntil: "load" });
        let activated = false;
        let strategy = null;
        if (state !== "default") {
          // 1) URL hash convention.
          const before = await page.evaluate(() => document.title + location.hash);
          await page.evaluate((s) => { location.hash = "#state=" + s; }, state);
          await page.waitForTimeout(250);
          // 2) select whose option text matches the state.
          const selectHandle = await page.locator("select").all();
          for (const handle of selectHandle) {
            const matched = await handle.evaluate((el, s) => {
              const option = [...el.options].find((o) => o.text.toLowerCase() === s.toLowerCase() || o.value.toLowerCase() === s.toLowerCase());
              if (option) { el.value = option.value; el.dispatchEvent(new Event("change", { bubbles: true })); return true; }
              return false;
            }, state).catch(() => false);
            if (matched) { activated = true; strategy = "select"; break; }
          }
          // 3) button whose text matches the state (last resort).
          if (!activated) {
            const button = page.getByRole("button", { name: new RegExp("^" + state + "$", "i") });
            if (await button.count().catch(() => 0)) {
              await button.first().click().catch(() => {});
              activated = true; strategy = "button";
            }
          }
          if (!activated) { activated = false; strategy = null; }
          await page.waitForTimeout(250);
          void before;
        } else {
          activated = true; strategy = "default";
        }
        const name = viewport + "-" + state + ".png";
        await page.screenshot({ path: path.join(outDir, name), fullPage: true }).catch(() => {
          return page.screenshot({ path: path.join(outDir, name) });
        });
        captures.push({ viewport, state, file: name, activated, strategy });
        await page.close();
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }
  return captureSummary(captures);
}

function parseArgs(args) {
  const options = { states: [...DEFAULT_STATES], viewports: [...DEFAULT_VIEWPORTS], json: false };
  for (let i = 0; i < args.length; i += 1) {
    const flag = args[i];
    if (flag === "--dir") options.dir = args[++i];
    else if (flag === "--out") options.out = args[++i];
    else if (flag === "--json") options.json = true;
    else if (flag === "--states") options.states = args[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (flag === "--viewports") options.viewports = args[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else throw new Error("Unknown option: " + flag);
  }
  if (!options.dir) throw new Error("Required option missing: --dir");
  if (!options.out) throw new Error("Required option missing: --out");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const indexHtml = await findIndexHtml(path.resolve(options.dir));
  const summary = await captureEvidence(indexHtml, options);
  if (options.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log("Captured " + summary.captures.length + " screenshots into " + path.resolve(options.out));
    for (const capture of summary.captures) {
      console.log("  " + (capture.activated ? "ACTIVATED" : "NOT-ACTIVATED") + " " + capture.file +
        (capture.strategy ? " (" + capture.strategy + ")" : ""));
    }
    if (!summary.all_activated) {
      console.log("Some states could not be activated; those screenshots show whatever the page rendered. " +
        "Make each state reachable from the page (state select, hash, or button) and re-capture.");
    }
  }
  process.exitCode = summary.all_activated ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Evidence capture failed: " + error.message);
    process.exitCode = 1;
  });
}
