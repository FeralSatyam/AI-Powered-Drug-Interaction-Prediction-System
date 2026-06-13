import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { computePolypharmacyRisk } from "@/lib/polypharmacyScore";

const ICON_MAP = {
  HIGH:     ShieldAlert,
  MODERATE: AlertTriangle,
  LOW:      ShieldCheck,
};

export function SideEffectsPanel({ interactions = [], confidence = 0 }) {
  const hasData = interactions.length > 0;

  return (
    <aside className="rounded-xl border border-[var(--border)] bg-white shadow-sm">
      <div className="border-b border-[var(--border)] px-4 py-3.5">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Polypharmacy Risk Score
        </p>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          {hasData
            ? "Overall prescription safety assessment"
            : "Run analysis to see results"}
        </p>
      </div>

      <div className="px-4 py-4">
        {!hasData ? (
          <p className="py-6 text-center text-xs text-[var(--muted)]">
            No data yet - analyse a medication combination first.
          </p>
        ) : (
          <RiskVerdictCard interactions={interactions} confidence={confidence} />
        )}
      </div>
    </aside>
  );
}

function RiskVerdictCard({ interactions, confidence }) {
  const risk = computePolypharmacyRisk(interactions, confidence);
  const Icon = ICON_MAP[risk.grade];
  const barPct = Math.round(risk.score * 100);

  return (
    <div className="flex flex-col gap-4">

      {/* Grade badge */}
      <div className={cn("rounded-xl border-2 p-4 text-center", risk.borderClass, risk.bgClass)}>
        <Icon className="mx-auto mb-1.5 size-7" style={{ color: risk.color }} />
        <p className="text-2xl font-black tracking-widest" style={{ color: risk.color }}>
          {risk.grade}
        </p>
        <p className={cn("text-xs font-medium mt-0.5", risk.textClass)}>
          {risk.label}
        </p>
      </div>

      {/* Risk index bar */}
      <div>
        <div className="flex justify-between text-[11px] text-[var(--muted)] mb-1">
          <span>Risk index</span>
          <span>{barPct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${barPct}%`, backgroundColor: risk.color }}
          />
        </div>
      </div>

      {/* Summary */}
      <p className="rounded-lg border border-[var(--border)] bg-gray-50 px-3 py-2.5 text-xs leading-relaxed text-[var(--foreground)]">
        {risk.summary}
      </p>

      {/* Severity breakdown */}
      <div className="flex justify-around border-t border-[var(--border)] pt-3">
        {[
          { num: risk.highCount,     label: "High",     color: "#dc2626" },
          { num: risk.moderateCount, label: "Moderate", color: "#d97706" },
          { num: risk.lowCount,      label: "Low",      color: "#16a34a" },
        ].map(({ num, label, color }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className="text-xl font-bold" style={{ color }}>
              {num}
            </span>
            <span className="text-[10px] text-[var(--muted)]">{label}</span>
          </div>
        ))}
      </div>

      {/* Confidence footer */}
      <p className="text-center text-[11px] text-[var(--muted)]">
        Model confidence: <span className="font-medium text-[var(--foreground)]">{confidence}%</span>
        {" "}· {risk.totalPairs} pair{risk.totalPairs !== 1 ? "s" : ""} checked
      </p>

    </div>
  );
}

// Keep this export - used by insights components
export { severityToRisk } from "@/lib/risk";
