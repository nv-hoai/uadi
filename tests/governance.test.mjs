import test from "node:test";
import assert from "node:assert/strict";
import { verifyApproval } from "../runtime/approval.mjs";
import { planRollback } from "../runtime/governance.mjs";
test("approval requires exact version and authenticated owner identity", () => {
 const approval = { approval_id: "a1", proposal_id: "p1", proposal_version: 3, decision: "APPROVE", actor_id: "human-1", timestamp: "2026-01-01T00:00:00Z" };
 const actor = { id: "human-1", roles: ["OWNER"] };
 assert.equal(verifyApproval({ approval, proposalId: "p1", proposalVersion: 3, authenticatedActor: actor }).valid, true);
 assert.equal(verifyApproval({ approval, proposalId: "p1", proposalVersion: 4, authenticatedActor: actor }).valid, false);
 assert.equal(verifyApproval({ approval, proposalId: "p1", proposalVersion: 3, authenticatedActor: { id: "model", roles: ["AGENT"] } }).valid, false);
});
test("rollback produces a new draft revision and requires same-scope approved target", () => {
 const current = { config_id: "c2", version: 2, status: "PUBLISHED", scope: { project_id: "p", level: "PROJECT" } };
 const target = { config_id: "c1", version: 1, status: "APPROVED", scope: { project_id: "p", level: "PROJECT" }, tokens: {} };
 const result = planRollback({ current, target, authenticatedActor: { id: "owner", roles: ["OWNER"] }, reason: "Restore stable design" });
 assert.equal(result.version, 3);
 assert.equal(result.status, "DRAFT");
 assert.equal(result.supersedes, "c2");
 assert.throws(() => planRollback({ current, target: { ...target, status: "DRAFT" }, authenticatedActor: { id: "owner", roles: ["OWNER"] }, reason: "x" }), /approved/);
});
