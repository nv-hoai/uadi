import fs from "node:fs";
import path from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = process.cwd();
const schemaDir = path.join(root, "schemas");
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

const schemaFiles = fs.readdirSync(schemaDir).filter((f) => f.endsWith(".schema.json"));
for (const file of schemaFiles) {
  const schema = JSON.parse(fs.readFileSync(path.join(schemaDir, file), "utf8"));
  ajv.addSchema(schema);
}
const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("Usage: npm run validate -- <artifact.json> [...]");
  process.exit(2);
}
let failed = false;
for (const target of targets) {
  const absolute = path.resolve(root, target);
  const artifact = JSON.parse(fs.readFileSync(absolute, "utf8"));
  const schemaName = path.basename(path.dirname(target)) === "component-catalog"\n    ? "component-catalog.schema.json"\n    : path.basename(target).replace(/\.json$/, ".schema.json");
  const schemaPath = path.join(schemaDir, schemaName);
  if (!fs.existsSync(schemaPath)) {
    console.error(`No matching schema: ${schemaName}`);
    failed = true;
    continue;
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  const validate = ajv.getSchema(schema.$id) ?? ajv.compile(schema);
  if (validate(artifact)) console.log(`PASS ${target}`);
  else {
    failed = true;
    console.error(`FAIL ${target}`);
    for (const error of validate.errors ?? []) console.error(`  ${error.instancePath} ${error.message}`);
  }
}
if (failed) process.exit(1);
