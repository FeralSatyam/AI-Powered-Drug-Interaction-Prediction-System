"use client";

import { Chip } from "@/components/ui/Chip";
import { SearchCombobox } from "@/components/ui/SearchCombobox";
import { COMMON_SYMPTOMS, searchSymptoms } from "@/lib/data/symptoms";
import type { PreviewAnalysis } from "@/lib/types";

interface SymptomsSectionProps {
  symptoms: string[];
  medications: string[];
  onAdd: (symptom: string) => void;
  onRemove: (symptom: string) => void;
  disabled?: boolean;
  preview?: PreviewAnalysis | null;
  isAnalyzing?: boolean;
  onOpenInsights?: () => void;
}

const QUICK_SYMPTOMS = COMMON_SYMPTOMS.slice(0, 6);

export function SymptomsSection({
  symptoms,
  medications,
  onAdd,
  onRemove,
  disabled = false,
  preview = null,
  isAnalyzing = false,
  onOpenInsights,
}: SymptomsSectionProps) {
  function toggleSymptom(symptom: string) {
    if (symptoms.includes(symptom)) {
      onRemove(symptom);
    } else {
      onAdd(symptom);
    }
  }

  const showInsightBanner =
    medications.length >= 2 && (preview?.hasSignificantFindings || isAnalyzing);

  return (
    <section
      className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm"
      aria-labelledby="symptoms-heading"
    >
      <h2 id="symptoms-heading" className="mb-4 text-lg font-semibold text-[var(--foreground)]">
        Patient Symptoms
      </h2>

      {showInsightBanner && (
        <div className="mb-5 animate-fade-slide-up overflow-hidden rounded-2xl border border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-teal-50/80 p-4 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15 ${
                  isAnalyzing ? "animate-symptom-pulse" : ""
                }`}
              >
                {isAnalyzing ? (
                  <svg className="h-5 w-5 animate-spin text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {isAnalyzing
                    ? "Analyzing medication interactions..."
                    : `${preview?.interactions.length ?? 0} interaction${(preview?.interactions.length ?? 0) !== 1 ? "s" : ""} · ${preview?.insights.length ?? 0} potential cause${(preview?.insights.length ?? 0) !== 1 ? "s" : ""}`}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {isAnalyzing
                    ? "Checking side effects and symptom correlations"
                    : preview?.insights[0]?.headline ?? "Review medication insights"}
                </p>
              </div>
            </div>
            {!isAnalyzing && preview?.hasSignificantFindings && onOpenInsights && (
              <button
                type="button"
                onClick={onOpenInsights}
                className="shrink-0 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--primary-hover)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
              >
                View insights
              </button>
            )}
          </div>
        </div>
      )}

      <SearchCombobox
        label="Search symptoms"
        placeholder="Search or select symptoms..."
        options={symptoms}
        onSearch={searchSymptoms}
        onSelect={onAdd}
        disabled={disabled}
      />

      <div className="mt-4">
        <p className="mb-2.5 text-sm font-medium text-[var(--muted)]">Common</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_SYMPTOMS.map((symptom) => (
            <Chip
              key={symptom}
              label={symptom}
              variant="suggestion"
              selected={symptoms.includes(symptom)}
              onClick={() => !disabled && toggleSymptom(symptom)}
            />
          ))}
        </div>
      </div>

      {symptoms.length > 0 && (
        <div className="mt-5">
          <p className="mb-2.5 text-sm font-medium text-[var(--muted)]">Selected</p>
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom) => (
              <Chip key={symptom} label={symptom} onRemove={() => onRemove(symptom)} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
