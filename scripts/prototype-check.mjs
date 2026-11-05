import fs from "node:fs";
const [file] = process.argv.slice(2);
if (!file) { console.error("Usage: node scripts/prototype-check.mjs <uds.json>"); process.exit(2); }
const spec = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
if (!Array.isArray(spec.pages) || spec.pages.length === 0) errors.push("UDS must contain at least one page");
const ids = new Set(["uadi.layout.page-shell", "uadi.navigation.primary", "uadi.feedback.alert", "uadi.form.field", "uadi.data.empty-state"]);
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
