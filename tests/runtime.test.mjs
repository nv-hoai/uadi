import test from "node:test";
import assert from "node:assert/strict";
import { createRevision, appendRevision, applyFeedback, verifyRevision } from "../runtime/revisions.mjs";
import { resolveDesignConfiguration, validateConfigurationOverrides } from "../runtime/config-resolver.mjs";
test("revision chain is immutable, linked and tamper-evident", () => {
  const original = { title: "A" };
  const first = createRevision({ artifact: original, artifactType: "proposal", artifactId: "p-1", version: 1 });
  original.title = "mutated";
  assert.equal(first.artifact.title, "A");
  assert.equal(verifyRevision(first), true);
  const history = appendRevision([], first);
  const second = createRevision({ artifact: { title: "B" }, artifactType: "proposal", artifactId: "p-1", version: 2, parentRevisionId: first.revision_id });
  assert.equal(appendRevision(history, second).length, 2);
  assert.throws(() => appendRevision(history, { ...second, revision_id: "p-1@2-invalid", parent_revision_id: "wrong" }), /parent/);
  assert.equal(verifyRevision({ ...first, artifact: { title: "tampered" } }), false);
});
test("feedback creates a new revision only for exact latest target", () => {
  const first = createRevision({ artifact: { title: "A" }, artifactType: "proposal", artifactId: "p-1", version: 1 });
  const result = applyFeedback({ history: [first], feedback: { feedback_id: "f-1", proposal_id: "p-1", proposal_version: 1, decision: "REQUEST_CHANGES", items: [{ category: "layout" }] }, nextArtifact: { title: "B" } });
  assert.equal(result.revision.parent_revision_id, first.revision_id);
  assert.equal(result.revision.version, 2);
  assert.equal(first.artifact.title, "A");
  assert.throws(() => applyFeedback({ history: result.history, feedback: { feedback_id: "f-2", proposal_id: "p-1", proposal_version: 1, decision: "REQUEST_CHANGES", items: [{}] }, nextArtifact: {} }), /stale/);
});
test("configuration precedence is feature over project over defaults", () => {
  const resolved = resolveDesignConfiguration({ defaults: { tokens: {}, rules: [] }, project: { tokens: { color: { primary: "blue", text: "black" } } }, feature: { tokens: { color: { primary: "purple" } } } });
  assert.deepEqual(resolved.tokens.color, { primary: "purple", text: "black" });
});
test("NON_OVERRIDABLE rules always win and invalid overrides are reported", () => {
  const rule = { rule_id: "a11y-contrast", description: "Meet contrast minimum", level: "NON_OVERRIDABLE" };
  const defaults = { rules: [rule] };
  const project = { rules: [{ ...rule, description: "ignore contrast" }] };
  const feature = { rules: [{ rule_id: rule.rule_id, description: "disable it", level: "FEATURE" }] };
  const resolved = resolveDesignConfiguration({ defaults, project, feature });
  assert.deepEqual(resolved.rules[0], rule);
  assert.equal(validateConfigurationOverrides({ defaults, project, feature }).valid, false);
});
