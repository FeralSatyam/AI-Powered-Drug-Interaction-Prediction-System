import { MostLikelyCauseVisual } from "@/components/insights/MostLikelyCauseVisual";
import { useEffect, useRef } from "react";

export function InsightModal({
  preview,
  isOpen,
  onClose,
  medicationCount,
  symptomCount,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close insight panel"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="insight-modal-title"
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col animate-fade-slide-up overflow-hidden rounded-t-3xl border border-white/30 bg-gradient-to-b from-white/95 to-slate-50/95 shadow-2xl backdrop-blur-xl sm:mx-4 sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-white/40 px-5 py-4 sm:px-6">
          <div>
            <h2 id="insight-modal-title" className="text-lg font-semibold text-[var(--foreground)]">
              Medication Insights
            </h2>
            <p className="mt-0.5 text-sm text-[var(--muted)]">
              {medicationCount} medications · {symptomCount} symptoms · {preview.interactions.length} interaction{preview.interactions.length !== 1 ? "s" : ""} detected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-[var(--muted)] transition-colors hover:bg-white hover:text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[var(--primary)]/5 px-4 py-3 ring-1 ring-[var(--primary)]/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/15">
              <svg className="h-5 w-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--foreground)]">
              Live analysis of potential interactions, side effects, and symptom correlations based on current entries.
            </p>
          </div>

          <MostLikelyCauseVisual
            insights={preview.insights}
            autoExpandPrimary
            title="Most Likely Causes"
          />
        </div>

        <div className="border-t border-white/40 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-12 w-full rounded-xl bg-[var(--primary)] text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
