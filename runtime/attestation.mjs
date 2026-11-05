import { verify as verifySignature, createPublicKey } from "node:crypto";

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

export function canonicalGatePayload(gateResult) {
  if (!gateResult || typeof gateResult !== "object") throw new Error("gate result is required");
  const { attestation: _attestation, ...payload } = gateResult;
  return JSON.stringify(stable(payload));
}

export function verifyGateAttestation(gateResult, { publicKey, expectedKeyId } = {}) {
  try {
    if (!gateResult?.attestation || gateResult.attestation.algorithm !== "Ed25519") return false;
    if (!gateResult.attestation.keyId || !gateResult.attestation.signature || !publicKey) return false;
    if (expectedKeyId && gateResult.attestation.keyId !== expectedKeyId) return false;
    const key = publicKey?.type === "public" ? publicKey : createPublicKey(publicKey);
    const signature = Buffer.from(gateResult.attestation.signature, "base64");
    if (signature.length !== 64) return false;
    return verifySignature(null, Buffer.from(canonicalGatePayload(gateResult)), key, signature);
  } catch {
    return false;
  }
}
