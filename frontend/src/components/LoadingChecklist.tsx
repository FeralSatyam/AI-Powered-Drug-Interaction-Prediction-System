"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Checking side effects",
  "Checking drug interactions",
  "Matching symptoms",
  "Calculating confidence",
];

export function LoadingChecklist() {
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCompletedSteps((prev) => (prev < STEPS.length ? prev + 1 : prev));
    }, 550);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="rounded-xl border border-[var(--border)] bg-white p-8 shadow-sm"
      role="status"
      aria-live="polite"
      aria-label="Analyzing medications"
    >
      <h2 className="mb-6 text-xl font-semibold text-[var(--foreground)]">
        Analyzing medications...
      </h2>
      <ul className="space-y-4">
        {STEPS.map((step, index) => {
          const isComplete = index < completedSteps;
          const isActive = index === completedSteps;

          return (
            <li key={step} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm transition-colors ${
                  isComplete
                    ? "bg-[var(--primary)] text-white"
                    : isActive
                      ? "border-2 border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-2 border-[var(--border)] bg-white"
                }`}
                aria-hidden
              >
                {isComplete && (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>
              <span
                className={`text-[15px] ${
                  isComplete || isActive
                    ? "font-medium text-[var(--foreground)]"
                    : "text-[var(--muted)]"
                }`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
