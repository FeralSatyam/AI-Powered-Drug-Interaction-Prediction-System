import { History } from "lucide-react";

import { usePatients } from "@/context/PatientContext";
import { formatWhen, RISK_TONE } from "@/lib/risk";
import { cn } from "@/lib/utils";

// Compact, read-only log of the active patient's past analyses.
export function PatientHistoryPanel() {
  const { history, currentPatient } = usePatients();

  if (!currentPatient || history.length === 0) return null;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <History className="size-4 text-[var(--muted)]" />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Analysis history
        </h3>
        <span className="text-xs text-[var(--muted)]">· {currentPatient.name}</span>
      </div>
      <ul className="divide-y divide-[var(--border)]">
        {history.map((entry) => {
          const tone = RISK_TONE[entry.riskLevel] ?? RISK_TONE.low;
          return (
            <li key={entry.id} className="flex items-center gap-3 py-2.5">
              <span className={cn("size-2 shrink-0 rounded-full", tone.dot)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">
                  {entry.medications.join(" · ")}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  {formatWhen(entry.createdAt)}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium",
                  tone.badge
                )}
              >
                {tone.label}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
