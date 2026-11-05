import { verifyRevision } from "./revisions.mjs";
import { verifyApproval } from "./approval.mjs";
export function validatePublication({ revision, approval, authenticatedActor, configuration }) {
 const errors = [];
 if (!revision || !verifyRevision(revision)) errors.push("revision missing or content digest invalid");
 if (revision && configuration?.source?.proposal_id !== revision.artifact?.proposal_id && revision.artifact_type === "proposal") errors.push("configuration source proposal does not match revision");
 const approvalResult = verifyApproval({ approval, proposalId: revision?.artifact_id, proposalVersion: revision?.version, authenticatedActor });
 errors.push(...approvalResult.errors);
 if (configuration?.status !== "APPROVED" && configuration?.status !== "PUBLISHED") errors.push("configuration must be approved or published");
 if (configuration?.source?.proposal_id !== revision?.artifact_id || configuration?.source?.proposal_version !== revision?.version) errors.push("configuration source must reference the exact approved proposal revision");
 return { valid: errors.length === 0, errors };
}
export function planRollback({ current, target, authenticatedActor, reason }) {
 if (!current || !target) throw new Error("current and target configurations are required");
 if (current.scope?.project_id !== target.scope?.project_id || current.scope?.feature_id !== target.scope?.feature_id || current.scope?.level !== target.scope?.level) throw new Error("rollback target must have the same scope");
 if (!["APPROVED", "PUBLISHED"].includes(target.status)) throw new Error("rollback target must be previously approved or published");
 if (!authenticatedActor?.id || !authenticatedActor.roles?.includes("OWNER")) throw new Error("authenticated OWNER approval is required");
 if (!reason?.trim()) throw new Error("rollback reason is required");
 return { ...structuredClone(target), config_id: `${target.config_id}-rollback-${Date.now()}`, version: current.version + 1, status: "DRAFT", supersedes: current.config_id, rollback: { target_config_id: target.config_id, reason, requested_by: authenticatedActor.id } };
}
