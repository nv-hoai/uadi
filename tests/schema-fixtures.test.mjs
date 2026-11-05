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

test("minimal project context fixture validates", () => {
  const schema = JSON.parse(fs.readFileSync(path.join(root, "schemas/project-context.schema.json"), "utf8"));
  const fixture = JSON.parse(fs.readFileSync(path.join(root, "examples/minimal/project-context.json"), "utf8"));
  assert.equal(ajv.validate(schema, fixture), true, JSON.stringify(ajv.errors, null, 2));
});

test("minimal discovery fixture validates", () => {
  const schema = JSON.parse(fs.readFileSync(path.join(root, "schemas/discovery-result.schema.json"), "utf8"));
  const fixture = JSON.parse(fs.readFileSync(path.join(root, "examples/minimal/discovery-result.json"), "utf8"));
  assert.equal(ajv.validate(schema, fixture), true, JSON.stringify(ajv.errors, null, 2));
});

test("discovery fixture rejects unsupported readiness values", () => {
  const schema = JSON.parse(fs.readFileSync(path.join(root, "schemas/discovery-result.schema.json"), "utf8"));
  const fixture = JSON.parse(fs.readFileSync(path.join(root, "examples/minimal/discovery-result.json"), "utf8"));
  fixture.readiness = "READY_MAYBE";
  assert.equal(ajv.validate(schema, fixture), false);
});
