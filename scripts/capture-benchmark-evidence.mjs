#!/usr/bin/env node
import { createReadStream } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(new URL("../renderers/react/package.json", import.meta.url));
const { chromium } = require("playwright");
const axePath = require.resolve("axe-core/axe.min.js");

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};

async function serveDirectory(root) {
  const server = createServer((request, response) => {
    const requested = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    const relative = requested === "/" ? "index.html" : requested.replace(/^\/+/, "");
    const filePath = path.resolve(root, relative);
    if (!filePath.startsWith(root + path.sep)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const stream = createReadStream(filePath);
    stream.on("error", () => response.writeHead(404).end("Not found"));
    stream.on("open", () => {
      response.writeHead(200, { "content-type": CONTENT_TYPES[path.extname(filePath)] ?? "application/octet-stream" });
      stream.pipe(response);
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return { server, url: "http://127.0.0.1:" + port + "/" };
}

function parseArgs(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 1) {
    const flag = args[i];
    if (!["--project", "--out"].includes(flag)) throw new Error("Unknown option: " + flag);
    const value = args[++i];
    if (!value || value.startsWith("--")) throw new Error("Missing value for " + flag);
    options[flag.slice(2)] = value;
  }
  if (!options.project || !options.out) throw new Error("--project and --out are required");
  return options;
}

async function inspect(page, label) {
  return page.evaluate((viewportLabel) => {
    const root = document.documentElement;
    const controls = [...document.querySelectorAll("button, a[href], input, select, textarea, [role=button], [tabindex]")];
    const unnamed = controls.filter((element) => {
      const text = (element.textContent ?? "").trim();
      const aria = element.getAttribute("aria-label") ?? "";
      const labelledBy = element.getAttribute("aria-labelledby");
      const labelled = labelledBy ? document.getElementById(labelledBy)?.textContent?.trim() : "";
      const labelledControl = element.id ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`) : null;
      const wrapped = element.closest("label");
      return !text && !aria && !labelled && !labelledControl && !wrapped;
    }).length;
    return {
      viewport: viewportLabel,
      title: document.title,
      lang: root.getAttribute("lang"),
      has_main: Boolean(document.querySelector("main")),
      h1_count: document.querySelectorAll("h1").length,
      headings: [...document.querySelectorAll("h1,h2,h3")].slice(0, 20).map((heading) => heading.textContent.trim()),
      control_count: controls.length,
      controls_without_accessible_name: unnamed,
      horizontal_overflow: root.scrollWidth > root.clientWidth + 1,
      document_width: root.scrollWidth,
      client_width: root.clientWidth
    };
  }, label);
}

async function captureViewport(browser, projectUrl, outDir, name, viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(projectUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, name + ".png"), fullPage: true });
  const inspection = await inspect(page, name);
  let axe = null;
  try {
    await page.addScriptTag({ content: await readFile(axePath, "utf8") });
    axe = await page.evaluate(async () => {
      const result = await window.axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] }
      });
      return {
        violations: result.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          nodes: violation.nodes.length
        })),
        passes: result.passes.length,
        incomplete: result.incomplete.length
      };
    });
  } catch (error) {
    axe = { error: error.message };
  }
  await context.close();
  return { ...inspection, console_errors: consoleErrors, page_errors: pageErrors, axe };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const projectDir = path.resolve(options.project);
  const outDir = path.resolve(options.out);
  await mkdir(path.join(outDir, "screenshots"), { recursive: true });
  const { server, url: projectUrl } = await serveDirectory(projectDir);
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const desktop = await captureViewport(browser, projectUrl, path.join(outDir, "screenshots"), "desktop", { width: 1280, height: 900 });
    const mobile = await captureViewport(browser, projectUrl, path.join(outDir, "screenshots"), "mobile", { width: 390, height: 844 });
    const checks = {
      project: projectDir,
      captured_at: new Date().toISOString(),
      url: projectUrl,
      desktop,
      mobile,
      note: "Automated rendered checks only. Axe covers the rules it ran; it is not proof of accessibility or WCAG conformance."
    };
    await writeFile(path.join(outDir, "checks.json"), JSON.stringify(checks, null, 2) + "\n");
    console.log(JSON.stringify({
      out: outDir,
      desktop_overflow: desktop.horizontal_overflow,
      mobile_overflow: mobile.horizontal_overflow,
      desktop_console_errors: desktop.console_errors.length,
      desktop_page_errors: desktop.page_errors.length,
      axe_violations: desktop.axe?.violations?.length ?? null
    }));
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error("Evidence capture failed: " + error.message);
  process.exitCode = 1;
});
