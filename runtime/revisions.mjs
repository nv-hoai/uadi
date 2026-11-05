import crypto from "node:crypto";
const clone = (value) => structuredClone(value);
const digest = (value) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
export function createRevision({ artifact, artifactType, artifactId, version, parentRevisionId = null, feedbackId = null, createdAt = new Date().toISOString() }) {
  if (!artifact || !artifactType || !artifactId) throw new Error("artifact, artifactType and artifactId are required");
  if (!Number.isInteger(version) || version < 1) throw new Error("version must be a positive integer");
  if (version === 1 && parentRevisionId !== null) throw new Error("initial revision cannot have a parent");
  if (version > 1 && !parentRevisionId) throw new Error("subsequent revisions must link to a parent");
  const snapshot = clone(artifact);
  return Object.freeze({ revision_id: `${artifactId}@${version}`, artifact_id: artifactId, artifact_type: artifactType, version, parent_revision_id: parentRevisionId, feedback_id: feedbackId, created_at: createdAt, content_sha256: digest(snapshot), artifact: snapshot });
}
export function appendRevision(history, revision) {
  const entries = [...history];
  if (entries.some((item) => item.revision_id === revision.revision_id)) throw new Error("revision already exists");
  const latest = entries.filter((item) => item.artifact_id === revision.artifact_id).sort((a,b) => b.version-a.version)[0];
  if (!latest && revision.version !== 1) throw new Error("first revision must be version 1");
  if (latest && (revision.version !== latest.version + 1 || revision.parent_revision_id !== latest.revision_id)) throw new Error("revision must increment the latest version and reference its exact parent");
  entries.push(clone(revision));
  return entries;
}
export function applyFeedback({ history, feedback, nextArtifact }) {
  if (!feedback || feedback.decision !== "REQUEST_CHANGES") throw new Error("only REQUEST_CHANGES creates a revision");
  const parent = history.find((item) => item.artifact_id === feedback.proposal_id && item.version === feedback.proposal_version);
  if (!parent) throw new Error("feedback target proposal/version was not found");
  const latest = history.filter((item) => item.artifact_id === parent.artifact_id).sort((a,b) => b.version-a.version)[0];
  if (latest.revision_id !== parent.revision_id) throw new Error("feedback target is stale; rebase against the latest revision");
  if (!Array.isArray(feedback.items) || feedback.items.length === 0) throw new Error("revision feedback must contain at least one item");
  const revision = createRevision({ artifact: nextArtifact, artifactType: parent.artifact_type, artifactId: parent.artifact_id, version: latest.version + 1, parentRevisionId: parent.revision_id, feedbackId: feedback.feedback_id });
  return { history: appendRevision(history, revision), revision };
}
export function verifyRevision(revision) { return digest(revision.artifact) === revision.content_sha256; }
