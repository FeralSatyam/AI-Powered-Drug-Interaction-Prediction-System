import { cn } from "@/lib/utils";

export const DEMO_MEDICATIONS = [
  { name: "Warfarin",    use: "Prevents blood clots" },
  { name: "Aspirin",     use: "Pain relief & antiplatelet" },
  { name: "Ibuprofen",   use: "Anti-inflammatory (NSAID)" },
  { name: "Lisinopril",  use: "Lowers blood pressure" },
  { name: "Metformin",   use: "Controls blood sugar" },
  { name: "Simvastatin", use: "Reduces cholesterol" },
];

const RISK_COVERAGE = [
  { color: "bg-red-500",     label: "High" },
  { color: "bg-amber-500",   label: "Moderate" },
  { color: "bg-emerald-500", label: "Low" },
];

export function DemoPanel({ onLoad, currentMeds = [] }) {
  const demoNames = DEMO_MEDICATIONS.map((d) => d.name);
  const allLoaded = demoNames.every((n) => currentMeds.includes(n));

  return (
    <aside className="rounded-xl border border-[var(--border)] bg-white shadow-sm">
      <div className="border-b border-[var(--border)] px-4 py-3.5">
        <p className="text-sm font-semibold text-[var(--foreground)]">Demo scenario</p>
        <p className="mt-0.5 text-xs text-[var(--muted)]">6 medications · all risk levels</p>
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {DEMO_MEDICATIONS.map((med) => (
          <li key={med.name} className="flex items-start gap-3 px-4 py-3">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/50" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)]">{med.name}</p>
              <p className="text-xs leading-snug text-[var(--muted)]">{med.use}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-[var(--border)] px-4 py-3.5">
        <p className="mb-2 text-[11px] font-medium text-[var(--muted)] uppercase tracking-wide">
          Risk coverage
        </p>
        <div className="mb-3.5 flex gap-3">
          {RISK_COVERAGE.map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
              <span className={cn("size-2 shrink-0 rounded-full", color)} />
              {label}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onLoad(demoNames)}
          disabled={allLoaded}
          className={cn(
            "w-full rounded-lg py-2 text-xs font-semibold transition-colors",
            allLoaded
              ? "cursor-default border border-[var(--border)] text-[var(--muted)]"
              : "bg-primary text-primary-foreground hover:opacity-90"
          )}
        >
          {allLoaded ? "Demo loaded" : "Load demo"}
        </button>
      </div>
    </aside>
  );
}
