import fs from "node:fs";
import { evaluateRelease } from "../runtime/gates.mjs";
import { verifyGateAttestation } from "../runtime/attestation.mjs";

const file = process.argv[2];
const publicKeyPath = process.argv[3];
const keyId = process.argv[4];
if (!file || !publicKeyPath || !keyId) {
  console.error("Usage: node scripts/check-gates.mjs <gate-release-report.json> <trusted-public-key.pem> <key-id>");
  process.exit(2);
}
let report;
let publicKey;
try {
  report = JSON.parse(fs.readFileSync(file, "utf8"));
  publicKey = fs.readFileSync(publicKeyPath, "utf8");
} catch (error) {
  console.error(`Cannot read release report or public key: ${error.message}`);
  process.exit(2);
}
const result = evaluateRelease({
  ...report,
  verifyAttestation: (gateResult) => verifyGateAttestation(gateResult, { publicKey, expectedKeyId: keyId })
});
for (const error of result.errors) console.error(`BLOCK ${error}`);
if (!result.ready) process.exit(1);
console.log(`PASS release readiness: ${result.evaluatedGateCount}/${result.requiredGateCount} signed gates`);
