export function verifyApproval({ approval, proposalId, proposalVersion, authenticatedActor }) {
 const errors = [];
 if (!approval) return { valid: false, errors: ["approval record is required"] };
 if (approval.proposal_id !== proposalId || approval.proposal_version !== proposalVersion) errors.push("approval does not match exact proposal ID/version");
 if (approval.decision !== "APPROVE") errors.push("approval decision must be APPROVE");
 if (!authenticatedActor?.id || !authenticatedActor?.roles?.includes("OWNER")) errors.push("host must provide an authenticated OWNER identity");
 if (approval.actor_id !== authenticatedActor?.id) errors.push("approval actor does not match authenticated actor");
 if (!approval.approval_id || !approval.timestamp) errors.push("approval ID and timestamp are required");
 return { valid: errors.length === 0, errors };
}
