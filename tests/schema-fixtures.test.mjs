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
test("minimal UDS fixture validates", () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(root, "examples/minimal/design-specification.json"), "utf8"));
  const validate = validatorFor("schemas/design-specification.schema.json");
  assert.equal(validate(fixture), true, JSON.stringify(validate.errors, null, 2));
});
test("revision schema enforces immutable revision metadata shape", () => {
  const fixture = { revision_id: "proposal-1@1", artifact_id: "proposal-1", artifact_type: "proposal", version: 1, parent_revision_id: null, created_at: "2026-01-01T00:00:00Z", content_sha256: "a".repeat(64), artifact: { title: "Draft" } };
  const validate = validatorFor("schemas/artifact-revision.schema.json");
  assert.equal(validate(fixture), true, JSON.stringify(validate.errors, null, 2));
  fixture.parent_revision_id = "proposal-1@0";
  assert.equal(validate(fixture), false);
});
test("gate result schema validates evidence bound to a precise artifact revision", () => {
  const fixture = { gateId: "SCHEMA_ARTIFACT", status: "PASS", artifactId: "proposal-1", artifactVersion: 1, artifactSha256: "a".repeat(64), evaluator: "RULE_ENGINE", checks: [{ checkId: "schema", status: "PASS", message: "schema valid", evidence: ["ci://run/123"] }], evidence: ["ci://run/123"], evaluatedAt: "2026-10-01T00:00:00Z" };
  const validate = validatorFor("schemas/gate-result.schema.json");
  assert.equal(validate(fixture), true, JSON.stringify(validate.errors, null, 2));
  fixture.artifactSha256 = "not-a-digest";
  assert.equal(validate(fixture), false);
});
test("quality evidence schema rejects missing or malformed provenance", () => {
  const fixture = { schemaVersion: "1.0.0", evidenceId: "ev-1", gateId: "DESIGN_QUALITY", artifactId: "proposal-1", artifactVersion: 1, artifactSha256: "b".repeat(64), evaluator: "HUMAN", outcome: "PASS", observedAt: "2026-10-01T00:00:00Z", runId: "review-1", checks: [{ id: "usability", result: "pass" }] };
  const validate = validatorFor("schemas/quality-evidence.schema.json");
  assert.equal(validate(fixture), true, JSON.stringify(validate.errors, null, 2));
  delete fixture.runId;
  assert.equal(validate(fixture), false);
});
