import fs from "node:fs";
import path from "node:path";
import { ROOT, loadSchemaRegistry, validatorFor, formatSchemaErrors } from "./schema-validation.mjs";

const [file] = process.argv.slice(2);
if (!file) { console.error("Usage: node scripts/prototype-check.mjs <uds.json>"); process.exit(2); }
let spec;
try { spec = JSON.parse(fs.readFileSync(path.resolve(file), "utf8")); }
catch (error) { console.error(`FAIL ${file}: ${error.message}`); process.exit(1); }

const registry = loadSchemaRegistry();
const validate = validatorFor(registry, "design-specification.schema.json");
if (!validate(spec)) {
  for (const error of formatSchemaErrors(validate.errors)) console.error(`FAIL ${file}: ${error}`);
  process.exit(1);
}

const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "component-catalog/catalog.json"), "utf8"));
const errors = [];
const ids = new Set(catalog.components.map((component) => component.component_id));
for (const page of spec.pages) {
  if (!page.page_id || !page.name) errors.push("Every page requires page_id and name");
  for (const section of page.sections ?? []) {
    if (!section.section_id) errors.push(`Page ${page.page_id}: section_id is required`);
    if (!ids.has(section.component_id)) errors.push(`Unsupported component ID: ${section.component_id}`);
  }
}
if (errors.length) { for (const error of errors) console.error(`FAIL ${error}`); process.exit(1); }
console.log(`PASS prototype contract: ${spec.pages.length} page(s)`);
