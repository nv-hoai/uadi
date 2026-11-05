import fs from "node:fs";
import { evaluateRelease } from "../runtime/gates.mjs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/check-gates.mjs <gate-release-report.json>");
  process.exit(2);
}
let report;
try {
  report = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  console.error(`Cannot read release report: ${error.message}`);
  process.exit(2);
}
const result = evaluateRelease(report);
for (const error of result.errors) console.error(`BLOCK ${error}`);
if (!result.ready) process.exit(1);
console.log(`PASS release readiness: ${result.evaluatedGateCount}/${result.requiredGateCount} gates`);
