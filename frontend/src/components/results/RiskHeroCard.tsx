import type { RiskLevel } from "@/lib/types";

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; border: string; bg: string; text: string; sublabel?: string }
> = {
  low: {
    label: "Low Risk",
    border: "border-l-[var(--risk-low)]",
    bg: "bg-[var(--risk-low-bg)]",
    text: "text-[var(--risk-low)]",
  },
  moderate: {
    label: "Moderate Risk",
    border: "border-l-[var(--risk-moderate)]",
    bg: "bg-[var(--risk-moderate-bg)]",
    text: "text-[var(--risk-moderate)]",
  },
  high: {
    label: "High Risk",
    border: "border-l-[var(--risk-high)]",
    bg: "bg-[var(--risk-high-bg)]",
    text: "text-[var(--risk-high)]",
  },
  critical: {
    label: "Critical Risk",
    border: "border-l-[var(--risk-critical)]",
    bg: "bg-red-50",
    text: "text-[var(--risk-critical)]",
    sublabel: "Review immediately",
  },
};

interface RiskHeroCardProps {
  level: RiskLevel;
  riskScore: number;
  confidence: number;
}

export function RiskHeroCard({ level, riskScore, confidence }: RiskHeroCardProps) {
  const config = RISK_CONFIG[level];

  return (
    <section
      className={`rounded-xl border border-[var(--border)] border-l-4 ${config.border} ${config.bg} p-6 shadow-sm`}
      aria-labelledby="risk-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="risk-heading" className={`text-3xl font-semibold tracking-tight sm:text-4xl ${config.text}`}>
            {config.label}
          </h2>
          {config.sublabel && (
            <p className="mt-1 text-sm font-medium text-[var(--risk-critical)]">
              {config.sublabel}
            </p>
          )}
        </div>
        <div className="text-left sm:text-right">
          <p className="text-sm font-medium text-[var(--muted)]">Confidence</p>
          <p className="text-2xl font-semibold tabular-nums text-[var(--foreground)]">
            {confidence}%
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium text-[var(--muted)]">Risk score</span>
          <span className="font-semibold tabular-nums text-[var(--foreground)]">
            {riskScore}/100
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/80">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              level === "low"
                ? "bg-[var(--risk-low)]"
                : level === "moderate"
                  ? "bg-[var(--risk-moderate)]"
                  : level === "high"
                    ? "bg-[var(--risk-high)]"
                    : "bg-[var(--risk-critical)]"
            }`}
            style={{ width: `${riskScore}%` }}
            role="progressbar"
            aria-valuenow={riskScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Risk score"
          />
        </div>
      </div>
    </section>
  );
}
