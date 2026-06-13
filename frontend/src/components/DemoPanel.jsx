import { cn } from "@/lib/utils";

const RISK_STYLE = {
  HIGH:   { dot: "bg-red-500",     badge: "bg-red-50 text-red-700 ring-red-200" },
  MEDIUM: { dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 ring-amber-200" },
  LOW:    { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
};

const DEMO_SCENARIOS = [
  {
    id:    "anticoagulant-nsaid",
    title: "Blood Thinner + Dual NSAIDs",
    risk:  "HIGH",
    medications: [
      { name: "Warfarin",   use: "Anticoagulant" },
      { name: "Aspirin",    use: "Antiplatelet" },
      { name: "Ibuprofen",  use: "NSAID" },
    ],
  },
  {
    id:    "serotonin-cascade",
    title: "Serotonin Cascade",
    risk:  "HIGH",
    medications: [
      { name: "Fluoxetine",    use: "Antidepressant (SSRI)" },
      { name: "Tramadol",      use: "Opioid analgesic" },
      { name: "Carbamazepine", use: "Anticonvulsant" },
    ],
  },
  {
    id:    "cardiac-conduction",
    title: "Cardiac Conduction Risk",
    risk:  "HIGH",
    medications: [
      { name: "Atenolol",  use: "Beta-blocker" },
      { name: "Verapamil", use: "Calcium channel blocker" },
      { name: "Warfarin",  use: "Anticoagulant" },
    ],
  },
  {
    id:    "antibiotic-anticoag-cardiac",
    title: "Antibiotic + Anticoagulant + Beta-Blocker",
    risk:  "MEDIUM",
    medications: [
      { name: "Warfarin",      use: "Anticoagulant" },
      { name: "Ciprofloxacin", use: "Antibiotic" },
      { name: "Bisoprolol",    use: "Beta-blocker" },
    ],
  },
  {
    id:    "safe-gi-lipid",
    title: "Safe GI + Lipid Therapy",
    risk:  "LOW",
    medications: [
      { name: "Amoxicillin",  use: "Antibiotic" },
      { name: "Omeprazole",   use: "Proton pump inhibitor" },
      { name: "Atorvastatin", use: "Statin" },
    ],
  },
];

export function DemoPanel({ onLoad, currentMeds = [] }) {
  return (
    <aside className="rounded-xl border border-[var(--border)] bg-white shadow-sm">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <p className="text-base font-semibold text-[var(--foreground)]">Demo scenarios</p>
        <p className="mt-0.5 text-sm text-[var(--muted)]">Load a preset to see the model in action</p>
      </div>

      <ul className="divide-y divide-[var(--border)]">
        {DEMO_SCENARIOS.map((scenario) => {
          const names     = scenario.medications.map((m) => m.name);
          const isLoaded  = names.every((n) => currentMeds.includes(n));
          const locked    = !!scenario.disabled;
          const { dot, badge } = RISK_STYLE[scenario.risk];

          return (
            <li key={scenario.id} className={cn("px-5 py-4 space-y-3", locked && "opacity-60")}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--foreground)] leading-snug">
                  {scenario.title}
                </p>
                <span className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                  badge
                )}>
                  {scenario.risk}
                </span>
              </div>

              <ul className="space-y-1.5">
                {scenario.medications.map((med) => (
                  <li key={med.name} className="flex items-center gap-2">
                    <span className={cn("size-2 shrink-0 rounded-full", dot)} />
                    <span className="text-sm font-medium text-[var(--foreground)]">{med.name}</span>
                    <span className="text-sm text-[var(--muted)]">- {med.use}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => !locked && onLoad(names)}
                disabled={isLoaded || locked}
                className={cn(
                  "w-full rounded-lg py-2 text-sm font-semibold transition-colors",
                  isLoaded || locked
                    ? "cursor-default border border-[var(--border)] text-[var(--muted)]"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                )}
              >
                {locked ? "Coming soon" : isLoaded ? "Loaded" : "Load"}
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
