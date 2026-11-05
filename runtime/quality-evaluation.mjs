export function evaluateQuality({ dimensions, minimumScore = 3.5, minimumCoverage = 1 }) {
  if (!Array.isArray(dimensions) || dimensions.length === 0) throw new Error("quality dimensions are required");
  if (!(minimumScore >= 1 && minimumScore <= 5) || !(minimumCoverage > 0 && minimumCoverage <= 1)) throw new Error("invalid quality policy thresholds");
  const seen = new Set();
  let weighted = 0;
  let totalWeight = 0;
  let coveredWeight = 0;
  const errors = [];
  for (const item of dimensions) {
    if (!item.id || seen.has(item.id)) throw new Error("dimension IDs must be present and unique");
    seen.add(item.id);
    if (!(item.weight > 0) || !Number.isFinite(item.weight)) throw new Error(`invalid weight for ${item.id}`);
    if (!Number.isInteger(item.score) || item.score < 1 || item.score > 5) throw new Error(`score for ${item.id} must be an integer from 1 to 5`);
    if (!Array.isArray(item.evidence) || item.evidence.length === 0) errors.push(`dimension ${item.id} has no supporting evidence`);
    else coveredWeight += item.weight;
    weighted += item.score * item.weight;
    totalWeight += item.weight;
  }
  const score = Number((weighted / totalWeight).toFixed(2));
  const coverage = Number((coveredWeight / totalWeight).toFixed(4));
  if (score < minimumScore) errors.push(`quality score ${score} is below minimum ${minimumScore}`);
  if (coverage < minimumCoverage) errors.push(`evidence coverage ${coverage} is below minimum ${minimumCoverage}`);
  return { passed: errors.length === 0, score, coverage, dimensions: dimensions.length, errors };
}
