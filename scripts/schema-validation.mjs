import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function loadSchemaRegistry({ root = ROOT } = {}) {
  const schemaDir = path.join(root, "schemas");
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const schemas = new Map();
  for (const file of fs.readdirSync(schemaDir).filter((name) => name.endsWith(".schema.json"))) {
    const schema = JSON.parse(fs.readFileSync(path.join(schemaDir, file), "utf8"));
    ajv.addSchema(schema);
    schemas.set(file, schema);
  }
  return { ajv, schemas };
}

export function validatorFor(registry, schemaName) {
  const schema = registry.schemas.get(schemaName);
  if (!schema) throw new Error(`Unknown schema "${schemaName}".`);
  const validate = registry.ajv.getSchema(schema.$id);
  if (!validate) throw new Error(`Schema is not registered: ${schemaName}`);
  return validate;
}

export function formatSchemaErrors(errors) {
  return (errors ?? []).map((error) => `${error.instancePath || "/"} ${error.message}`);
}
