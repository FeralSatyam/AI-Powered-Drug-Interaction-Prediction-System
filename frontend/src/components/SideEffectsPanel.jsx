import { cn } from "@/lib/utils";
import { titleCase } from "@/lib/text";

// Color by probability: high → red, mid → amber, low → green
function chipStyle(prob) {
  if (prob >= 0.65) return "bg-red-50 text-red-700 border border-red-200";
  if (prob >= 0.35) return "bg-amber-50 text-amber-700 border border-amber-200";
  return "bg-emerald-50 text-emerald-700 border border-emerald-200";
}

export function SideEffectsPanel({ sideEffects = [] }) {
  // Already sorted high→low by the adapter; guard in case fallback isn't.
  const sorted = [...sideEffects].sort((a, b) => b.probability - a.probability).slice(0, 10);

  return (
    <aside className="rounded-xl border border-[var(--border)] bg-white shadow-sm">
      <div className="border-b border-[var(--border)] px-4 py-3.5">
        <p className="text-sm font-semibold text-[var(--foreground)]">Possible side effects</p>
        <p className="mt-0.5 text-xs text-[var(--muted)]">
          {sorted.length > 0
            ? `Top ${sorted.length} by confidence`
            : "Run analysis to see results"}
        </p>
      </div>

      <div className="px-4 py-3.5">
        {sorted.length === 0 ? (
          <p className="py-6 text-center text-xs text-[var(--muted)]">
            No data yet — analyze a medication combination first.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5">
              {sorted.map((effect) => (
                <span
                  key={effect.name}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
                    chipStyle(effect.probability)
                  )}
                >
                  {titleCase(effect.name)}
                  <span className="opacity-70">
                    {Math.round(effect.probability * 100)}%
                  </span>
                </span>
              ))}
            </div>
            <div className="mt-3.5 border-t border-[var(--border)] pt-3">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                Confidence score
              </p>
              <div className="flex gap-3">
              {[
                { cls: "bg-red-400",     label: "High" },
                { cls: "bg-amber-400",   label: "Mid" },
                { cls: "bg-emerald-400", label: "Low" },
              ].map(({ cls, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                  <span className={cn("size-2 rounded-full", cls)} />
                  {label}
                </span>
              ))}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
