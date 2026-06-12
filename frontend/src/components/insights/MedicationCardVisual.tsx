interface MedicationCardVisualProps {
  name: string;
  slideFrom?: "left" | "right" | "none";
  delay?: number;
}

export function MedicationCardVisual({
  name,
  slideFrom = "none",
  delay = 0,
}: MedicationCardVisualProps) {
  const slideClass =
    slideFrom === "left"
      ? "animate-slide-from-left"
      : slideFrom === "right"
        ? "animate-slide-from-right"
        : "animate-fade-in";

  return (
    <div
      className={`group relative min-w-[120px] max-w-[160px] flex-1 ${slideClass}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="glass-card rounded-2xl border border-white/40 p-4 text-center shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.5 15.3l-1.5 4.5-3-1.5-3 1.5-1.5-4.5"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold leading-tight text-[var(--foreground)]">{name}</p>
      </div>
    </div>
  );
}
