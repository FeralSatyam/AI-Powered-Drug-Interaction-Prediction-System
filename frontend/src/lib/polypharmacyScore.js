/**
 * Derives an overall polypharmacy risk from the pair_details array
 * already present in the ML result (via adapter.js → preview.interactions).
 *
 * Score formula: maxWeight * 0.4 + meanWeight * 0.6
 *   - maxWeight  = severity weight of the worst pair (sets the risk floor)
 *   - meanWeight = average severity weight across all pairs (captures burden)
 *   This prevents dilution: a single HIGH pair can never be washed out by many
 *   LOW pairs the way a plain average allows.
 *
 * Severity weights: critical=1.0, high=0.7, moderate=0.3, low=0.0
 * Grade thresholds: HIGH ≥ 0.70, MODERATE ≥ 0.25, LOW < 0.25
 */

const SEVERITY_WEIGHT = { critical: 1.0, high: 0.7, moderate: 0.3, low: 0.0 };

export function computePolypharmacyRisk(interactions = [], confidence = 0) {
  const total    = interactions.length;
  const critical = interactions.filter(i => i.severity === "critical").length;
  const high     = interactions.filter(i => i.severity === "high").length;
  const moderate = interactions.filter(i => i.severity === "moderate").length;
  const low      = interactions.filter(i => i.severity === "low").length;

  const weights   = interactions.map(i => SEVERITY_WEIGHT[i.severity] ?? 0);
  const maxWeight = total > 0 ? Math.max(...weights) : 0;
  const meanWeight = total > 0
    ? weights.reduce((s, w) => s + w, 0) / total
    : 0;

  // max drives the risk floor; mean captures overall prescription burden
  const score = Math.min(maxWeight * 0.4 + meanWeight * 0.6, 1.0);

  const base = {
    score,
    totalPairs:    total,
    criticalCount: critical,
    highCount:     critical + high,
    moderateCount: moderate,
    lowCount:      low,
  };

  if (critical > 0 || score >= 0.70) return {
    ...base,
    grade: "HIGH", label: "High Risk",
    color: "#dc2626",
    bgClass: "bg-red-50", borderClass: "border-red-200", textClass: "text-red-700",
    summary: `${critical + high} high-risk pair${critical + high !== 1 ? "s" : ""} detected across ${total} combination${total !== 1 ? "s" : ""}. Clinical review required before dispensing.`,
  };

  if (score >= 0.25) return {
    ...base,
    grade: "MODERATE", label: "Moderate Risk",
    color: "#d97706",
    bgClass: "bg-amber-50", borderClass: "border-amber-200", textClass: "text-amber-700",
    summary: `${critical + high + moderate} interacting pair${(critical + high + moderate) !== 1 ? "s" : ""} identified across ${total} combination${total !== 1 ? "s" : ""}. Monitor patient and review dosing.`,
  };

  return {
    ...base,
    grade: "LOW", label: "Low Risk",
    color: "#16a34a",
    bgClass: "bg-emerald-50", borderClass: "border-emerald-200", textClass: "text-emerald-700",
    summary: `No significant interactions across ${total} pair${total !== 1 ? "s" : ""}. Standard monitoring applies.`,
  };
}
