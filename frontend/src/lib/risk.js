// Maps an insight's visual severity to a stored risk level and the tone used by
// history badges and the network graph.
export function severityToRisk(severity) {
  if (severity === "high") return "high";
  if (severity === "moderate") return "moderate";
  return "low";
}

export const RISK_TONE = {
  high: {
    label: "High risk",
    badge: "bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  moderate: {
    label: "Moderate",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  low: {
    label: "Low risk",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
};

// "AV" style — kept here so history rows and cards format dates consistently.
export function formatWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  }) + " · " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
