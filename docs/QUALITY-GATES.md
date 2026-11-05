# UADI Quality Gates

UADI uses ten logical gates. They are policy checkpoints in the embedded workflow, not separately deployed services.

## Gate contract
Every result is bound to an exact artifact ID, version and SHA-256 digest and must carry an Ed25519 attestation from a trusted host evaluator. The host keeps the private signing key outside the model and repository; release verification uses an allowlisted public key/key ID. Changing any signed field invalidates the signature. Results are append-only evidence; changing the artifact invalidates evidence bound to the previous digest.

- PASS: all required checks passed.
- WARNING: a non-blocking concern remains; release policy decides whether warnings are allowed.
- FAIL: a required check failed.
- BLOCKED: a prerequisite, authority or safety boundary is unavailable.

## Gate map
1. INPUT_CONTEXT — completeness and provenance of project/feature context.
2. REQUIREMENT_COVERAGE — requirement-to-design traceability and unresolved unknowns.
3. DESIGN_QUALITY — evidence-backed UX, usability, consistency and trade-off review.
4. SCHEMA_ARTIFACT — JSON Schema, version, references and artifact integrity.
5. GOVERNANCE — catalog IDs, inheritance and NON_OVERRIDABLE constraints.
6. PROTOTYPE_RUNTIME — renderer mapping, typecheck, build and interaction execution.
7. UX_ACCESSIBILITY_VISUAL — keyboard, semantic/accessibility, responsive and visual tests.
8. SECURITY_SAFETY — secret scanning, policy review and isolated execution controls.
9. HUMAN_APPROVAL — authenticated owner approval bound to exact proposal ID/version; evaluator must be HOST_IDENTITY.
10. PUBLISH_REGRESSION — publication provenance, drift policy, regression and rollback readiness.

## Release policy
All ten gates must PASS for a normal release. A WARNING is not silently converted to PASS. An explicit policy may permit selected warnings, but never for approval, security blockers, failed schema validation or NON_OVERRIDABLE violations. Missing, stale, mismatched, duplicate or unsigned gate evidence blocks release. Gate 9 additionally requires passing authenticated-owner and exact-proposal-version checks.

## Evidence rules
- Store evidence with artifact ID, version, digest, evaluator, timestamp, run ID, check IDs and references to logs/reports.
- Sign gate results with a host-controlled Ed25519 key after the independent evaluator completes; never expose the private key to the model.
- Verify signatures against an allowlisted public key and key ID before release. Key rotation and revocation are host responsibilities.
- Do not overwrite evidence; append a new record for each evaluation.
- Re-run affected gates after artifact changes. At minimum, any artifact digest change invalidates every gate result bound to that artifact.
- Model self-review is advisory and cannot act as a trusted validator, test runner or owner identity provider.

## Quality scoring
Quality scores are decision support, not truth labels. Every scored dimension must cite evidence. Thresholds are configurable per project and should be calibrated against human review; a score cannot override a hard gate or signed owner approval.
