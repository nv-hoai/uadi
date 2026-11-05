import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = process.cwd();
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
for (const file of fs.readdirSync(path.join(root, "schemas")).filter((name) => name.endsWith(".schema.json"))) {
  ajv.addSchema(JSON.parse(fs.readFileSync(path.join(root, "schemas", file), "utf8")));
}

function validatorFor(schemaPath) {
  const schema = JSON.parse(fs.readFileSync(path.join(root, schemaPath), "utf8"));
  const validate = ajv.getSchema(schema.$id);
  assert.ok(validate, `Schema not registered: ${schema.$id}`);
  return validate;
}

test("minimal project context fixture validates", () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(root, "examples/minimal/project-context.json"), "utf8"));
  const validate = validatorFor("schemas/project-context.schema.json");
  assert.equal(validate(fixture), true, JSON.stringify(validate.errors, null, 2));
});

test("minimal discovery fixture validates", () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(root, "examples/minimal/discovery-result.json"), "utf8"));
  const validate = validatorFor("schemas/discovery-result.schema.json");
  assert.equal(validate(fixture), true, JSON.stringify(validate.errors, null, 2));
});

test("starter component catalog validates", () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(root, "component-catalog/catalog.json"), "utf8"));
  const validate = validatorFor("schemas/component-catalog.schema.json");
  assert.equal(validate(fixture), true, JSON.stringify(validate.errors, null, 2));
});

test("discovery fixture rejects unsupported readiness values", () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(root, "examples/minimal/discovery-result.json"), "utf8"));
  fixture.readiness = "READY_MAYBE";
  const validate = validatorFor("schemas/discovery-result.schema.json");
  assert.equal(validate(fixture), false);
});
