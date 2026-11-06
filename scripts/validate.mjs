import fs from "node:fs";
import path from "node:path";
import { loadSchemaRegistry, formatSchemaErrors } from "./schema-validation.mjs";

const { ajv, schemas } = loadSchemaRegistry();

const args = process.argv.slice(2);
let explicitSchema = null;
const targets = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--schema") {
    explicitSchema = args[++i];
    if (!explicitSchema) {
      console.error("Missing value for --schema.");
      process.exit(2);
    }
  } else targets.push(args[i]);
}
if (targets.length === 0) {
  console.error("Usage: npm run validate -- [--schema <schema-name>] <artifact.json> [...artifacts]");
  process.exit(2);
}
if (explicitSchema && !schemas.has(explicitSchema.endsWith(".schema.json") ? explicitSchema : explicitSchema + ".schema.json")) {
  console.error(`Unknown schema "${explicitSchema}". Available: ${[...schemas.keys()].join(", ")}`);
  process.exit(2);
}
const selectedSchema = explicitSchema
  ? (explicitSchema.endsWith(".schema.json") ? explicitSchema : explicitSchema + ".schema.json")
  : null;

let failed = false;
for (const target of targets) {
  try {
    const absolute = path.resolve(target);
    const artifact = JSON.parse(fs.readFileSync(absolute, "utf8"));
    const byName = path.basename(path.dirname(absolute)) === "component-catalog"
      ? "component-catalog.schema.json"
      : path.basename(absolute).replace(/\.json$/, ".schema.json");
    let schemaName = selectedSchema ?? (schemas.has(byName) ? byName : null);
    let validate = schemaName ? ajv.getSchema(schemas.get(schemaName).$id) : null;

    if (!validate) {
      const matches = [...schemas.entries()].filter(([, schema]) => ajv.getSchema(schema.$id)(artifact));
      if (matches.length === 1) {
        [schemaName] = matches[0];
        validate = ajv.getSchema(schemas.get(schemaName).$id);
      } else if (matches.length > 1) {
        throw new Error(`Artifact matches multiple schemas (${matches.map(([name]) => name).join(", ")}); pass --schema.`);
      } else if (!schemaName) {
        throw new Error(`Could not infer a schema from "${path.basename(target)}"; pass --schema <schema-name>.`);
      }
    }

    if (validate(artifact)) console.log(`PASS ${target} (${schemaName})`);
    else {
      failed = true;
      console.error(`FAIL ${target} (${schemaName})`);
      for (const error of formatSchemaErrors(validate.errors)) console.error(`  ${error}`);
    }
  } catch (error) {
    failed = true;
    console.error(`FAIL ${target}: ${error.message}`);
  }
}
if (failed) process.exit(1);
