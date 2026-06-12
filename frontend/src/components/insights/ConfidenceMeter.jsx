export function ConfidenceMeter({ value, animated = true, delay = 0 }) {
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--muted)]">Confidence</span>
        <span className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
          {value}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/50 ring-1 ring-white/60">
        <div
          className={`h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-teal-400 ${
            animated ? "animate-confidence-fill" : ""
          }`}
          style={{
            ["--confidence-target"]: `${value}%`,
            animationDelay: `${delay}ms`,
            width: animated ? undefined : `${value}%`,
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
