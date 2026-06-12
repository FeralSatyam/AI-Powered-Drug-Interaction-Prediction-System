const SEVERITY_CONFIG = {
  low: {
    label: "Low Risk",
    dot: "",
    className: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  moderate: {
    label: "Moderate Risk",
    dot: "",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  high: {
    label: "High Risk",
    dot: "",
    className: "bg-red-50 text-red-800 ring-red-200",
  },
};

export function SeverityBadge({ severity }) {
  const config = SEVERITY_CONFIG[severity];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          severity === "high"
            ? "bg-red-500"
            : severity === "moderate"
              ? "bg-amber-500"
              : "bg-emerald-500"
        }`}
        aria-hidden
      />
      {config.label}
    </span>
  );
}
