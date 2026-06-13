import { ConfidenceMeter } from "@/components/insights/ConfidenceMeter";
import { ConnectionLine } from "@/components/insights/ConnectionLine";
import { MedicationCardVisual } from "@/components/insights/MedicationCardVisual";
import { SeverityBadge } from "@/components/insights/SeverityBadge";
import { SymptomIcon } from "@/components/insights/SymptomIcon";
import { useEffect, useState } from "react";

export function CauseInsightCard({
  insight,
  index,
  isPrimary = false,
  autoExpand = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const isInteraction = insight.medications.length >= 2;

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), index * 120);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (autoExpand && isPrimary) {
      const timer = setTimeout(() => setExpanded(true), 800);
      return () => clearTimeout(timer);
    }
  }, [autoExpand, isPrimary]);

  return (
    <article
      className={`glass-card overflow-hidden rounded-2xl border border-white/50 shadow-xl transition-all duration-500 ${
        animateIn ? "animate-fade-slide-up" : "opacity-0"
      } ${expanded ? "ring-2 ring-[var(--primary)]/30" : ""}`}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => !showWhy && setExpanded(false)}
    >
      <div className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--primary)]/15 text-xs font-bold text-[var(--primary)]">
              {insight.rank}
            </span>
            {isPrimary && (
              <span className="rounded-full bg-[var(--primary)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--primary)]">
                Most likely
              </span>
            )}
          </div>
          <SeverityBadge severity={insight.severity} />
        </div>

        {isInteraction ? (
          <div className="mb-5 flex items-center justify-center gap-1 sm:gap-2">
            <MedicationCardVisual
              name={insight.medications[0]}
              slideFrom="left"
              delay={index * 100 + 200}
            />
            <ConnectionLine severity={insight.severity} animated={animateIn} />
            <MedicationCardVisual
              name={insight.medications[1]}
              slideFrom="right"
              delay={index * 100 + 200}
            />
          </div>
        ) : (
          <div className="mb-5 flex justify-center">
            <MedicationCardVisual
              name={insight.medications[0]}
              slideFrom="none"
              delay={index * 100 + 200}
            />
          </div>
        )}

        <p
          className={`mb-4 text-center text-[15px] font-medium leading-snug text-[var(--foreground)] ${
            animateIn ? "animate-stagger-text" : "opacity-0"
          }`}
          style={{ animationDelay: `${index * 100 + 400}ms` }}
        >
          {insight.headline}
        </p>

        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {insight.symptoms.map((symptom, i) => (
            <SymptomIcon
              key={symptom}
              symptom={symptom}
              pulsing={isPrimary && i === 0}
              delay={index * 100 + 500 + i * 80}
            />
          ))}
        </div>

        <div
          className={`mb-4 rounded-xl bg-white/40 p-3 text-sm text-[var(--muted)] transition-all duration-300 ${
            expanded ? "opacity-100" : "opacity-0 h-0 overflow-hidden p-0 mb-0"
          }`}
        >
          {insight.shortExplanation}
        </div>

        <ConfidenceMeter
          value={insight.likelihood}
          animated={animateIn}
          delay={index * 100 + 600}
        />

        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowWhy((v) => !v)}
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--primary)]/10 px-4 py-2 text-sm font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            aria-expanded={showWhy}
          >
            <span>Why?</span>
            <svg
              className={`h-4 w-4 transition-transform duration-300 ${showWhy ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            showWhy ? "mt-4 max-h-48 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="rounded-xl border border-white/60 bg-white/50 p-4 backdrop-blur-sm">
            {insight.detailedExplanation.split(". ").map((sentence, i) => (
              <p
                key={i}
                className={`text-sm leading-relaxed text-[var(--foreground)] ${
                  showWhy ? "animate-stagger-text" : ""
                } ${i > 0 ? "mt-2" : ""}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {sentence.trim()}
                {sentence.trim() && !sentence.endsWith(".") ? "." : ""}
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
