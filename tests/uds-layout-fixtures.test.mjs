import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSchemaRegistry, validatorFor, formatSchemaErrors } from "../scripts/schema-validation.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = JSON.parse(fs.readFileSync(path.join(ROOT, "examples/minimal/design-specification.json"), "utf8"));
const cases = JSON.parse(fs.readFileSync(path.join(ROOT, "tests/fixtures/uds-layout-cases.json"), "utf8")).cases;
const registry = loadSchemaRegistry();
const validate = validatorFor(registry, "design-specification.schema.json");

for (const fixtureCase of cases) {
  test(fixtureCase.name, () => {
    const spec = structuredClone(base);
    spec.pages[0].sections = [{
      section_id: "case",
      component_id: fixtureCase.component_id,
      layout: fixtureCase.layout
    }];
    assert.equal(
      validate(spec),
      fixtureCase.valid,
      `${fixtureCase.name}: ${JSON.stringify(formatSchemaErrors(validate.errors))}`
    );
  });
}

test("every supported UDS component has a positive and negative layout fixture", () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "component-catalog/catalog.json"), "utf8"));
  for (const component of catalog.components) {
    const matching = cases.filter((fixtureCase) => fixtureCase.component_id === component.component_id);
    assert.ok(matching.some((fixtureCase) => fixtureCase.valid), `Missing positive fixture for ${component.component_id}`);
    assert.ok(matching.some((fixtureCase) => !fixtureCase.valid), `Missing negative fixture for ${component.component_id}`);
  }
});
