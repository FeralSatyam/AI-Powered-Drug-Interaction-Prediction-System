import type { DetectedInteraction, InteractionSeverity } from "@/lib/types";

const SEVERITY_STYLES: Record<
  InteractionSeverity,
  { label: string; className: string }
> = {
  low: { label: "Low", className: "bg-gray-100 text-gray-700" },
  moderate: { label: "Moderate", className: "bg-[var(--risk-moderate-bg)] text-[var(--risk-moderate)]" },
  high: { label: "High", className: "bg-[var(--risk-high-bg)] text-[var(--risk-high)]" },
  critical: { label: "Critical", className: "bg-red-100 text-[var(--risk-critical)]" },
};

interface InteractionListProps {
  interactions: DetectedInteraction[];
}

export function InteractionList({ interactions }: InteractionListProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm" aria-labelledby="interactions-heading">
      <h2 id="interactions-heading" className="mb-5 text-lg font-semibold text-[var(--foreground)]">
        Detected interactions
      </h2>

      {interactions.length === 0 ? (
        <p className="text-[15px] text-[var(--muted)]">
          No major interactions detected between selected medications.
        </p>
      ) : (
        <ul className="space-y-4">
          {interactions.map((interaction) => {
            const severity = SEVERITY_STYLES[interaction.severity];
            return (
              <li
                key={interaction.medications.join("+")}
                className="rounded-lg border border-[var(--border)] bg-gray-50/50 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Interaction found
                </p>
                <p className="mt-1 text-base font-semibold text-[var(--foreground)]">
                  {interaction.medications.join(" + ")}
                </p>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  Potential association with:
                </p>
                <ul className="mt-1.5 flex flex-wrap gap-2">
                  {interaction.associatedSymptoms.map((symptom) => (
                    <li
                      key={symptom}
                      className="rounded-md bg-white px-2.5 py-1 text-sm font-medium text-[var(--foreground)] ring-1 ring-[var(--border)]"
                    >
                      {symptom}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm font-medium text-[var(--muted)]">Severity:</span>
                  <span
                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${severity.className}`}
                  >
                    {severity.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
