import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [file] = process.argv.slice(2);
if (!file) { console.error("Usage: node scripts/prototype-check.mjs <uds.json>"); process.exit(2); }
let spec;
try { spec = JSON.parse(fs.readFileSync(path.resolve(file), "utf8")); }
catch (error) { console.error(`FAIL ${file}: ${error.message}`); process.exit(1); }
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "component-catalog/catalog.json"), "utf8"));
const errors = [];
if (!Array.isArray(spec.pages) || spec.pages.length === 0) errors.push("UDS must contain at least one page");
const ids = new Set(catalog.components.map((component) => component.component_id));
for (const page of spec.pages ?? []) {
 if (!page.page_id || !page.name) errors.push("Every page requires page_id and name");
 for (const section of page.sections ?? []) {
  if (!section.section_id) errors.push(`Page ${page.page_id}: section_id is required`);
  if (!ids.has(section.component_id)) errors.push(`Unsupported component ID: ${section.component_id}`);
  if (section.component_id === "uadi.form.field" && section.layout?.type && !["text", "email", "number", "search", "tel", "url"].includes(section.layout.type)) errors.push(`Unsupported safe input type: ${section.layout.type}`);
 }
}
if (errors.length) { for (const error of errors) console.error(`FAIL ${error}`); process.exit(1); }
console.log(`PASS prototype contract: ${spec.pages.length} page(s)`);
