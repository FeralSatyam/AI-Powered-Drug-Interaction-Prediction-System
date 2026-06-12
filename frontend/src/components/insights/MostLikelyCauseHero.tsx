"use client";

import { InteractionDiagram } from "@/components/insights/InteractionDiagram";
import { SymptomsPanel } from "@/components/insights/SymptomsPanel";
import { SeverityBadge } from "@/components/insights/SeverityBadge";
import { resolveMedicinePair } from "@/lib/resolveMedicinePair";
import type { CauseInsight } from "@/lib/types";

interface MostLikelyCauseHeroProps {
  insight: CauseInsight;
  allMedications: string[];
  isAnalyzing?: boolean;
}

export function MostLikelyCauseHero({
  insight,
  allMedications,
  isAnalyzing = false,
}: MostLikelyCauseHeroProps) {
  const [medicineA, medicineB] = resolveMedicinePair(insight, allMedications);

  return (
    <section
      className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8"
      aria-labelledby="most-likely-cause"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            Clinical Insight
          </p>
          <h2
            id="most-likely-cause"
            className="mt-1 text-xl font-semibold text-[var(--foreground)]"
          >
            Most Likely Cause
          </h2>
          <p className="mt-1.5 max-w-prose text-sm text-[var(--muted)]">
            {medicineA} and {medicineB} may be interacting and contributing to reported symptoms.
          </p>
        </div>
        <SeverityBadge severity={insight.severity} />
      </div>

      {isAnalyzing ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div
            className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--primary)]"
            role="status"
            aria-label="Analyzing"
          />
          <p className="text-sm text-[var(--muted)]">Analyzing medication combination...</p>
        </div>
      ) : (
        <>
          <InteractionDiagram
            medicineA={medicineA}
            medicineB={medicineB}
            severity={insight.severity}
          />

          <SymptomsPanel symptoms={insight.symptoms} />

          <div className="mt-6 flex flex-col gap-4 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--muted)]">Likelihood</p>
              <p className="text-lg font-semibold tabular-nums text-[var(--foreground)]">
                {insight.likelihood}%
              </p>
            </div>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 sm:max-w-xs">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  insight.severity === "high"
                    ? "bg-red-500"
                    : insight.severity === "moderate"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${insight.likelihood}%` }}
                role="progressbar"
                aria-valuenow={insight.likelihood}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Interaction likelihood"
              />
            </div>
          </div>

          <details className="mt-5 group">
            <summary className="cursor-pointer text-sm font-medium text-[var(--primary)] marker:content-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 rounded">
              <span className="inline-flex items-center gap-1.5">
                Clinical explanation
                <svg
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-[var(--foreground)]">
              {insight.detailedExplanation}
            </p>
          </details>
        </>
      )}

      <p className="mt-6 text-center text-xs text-[var(--muted)]">
        Decision support only. Not a substitute for clinical judgment.
      </p>
    </section>
  );
}
