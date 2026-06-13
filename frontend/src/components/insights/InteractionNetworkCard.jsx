import { InteractionNetwork } from "@/components/insights/InteractionNetwork";

const LEGEND = [
  { color: "#ef4444", label: "High risk" },
  { color: "#f59e0b", label: "Moderate" },
];

export function InteractionNetworkCard({ medications, interactions }) {
  if (medications.length < 2) return null;

  const harmfulCount = interactions.filter(
    (ix) => ix.severity === "critical" || ix.severity === "high"
  ).length;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">
          Drug interaction map
        </h3>
        {harmfulCount > 0 ? (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
            {harmfulCount} high-risk pair{harmfulCount > 1 ? "s" : ""}
          </span>
        ) : (
          <span className="text-xs text-[var(--muted)]">Relationship map</span>
        )}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-gradient-to-b from-[#fafdfd] to-[#f1f6f7] p-3">
        <InteractionNetwork medications={medications} interactions={interactions} />
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {LEGEND.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <svg width="24" height="8" viewBox="0 0 24 8" aria-hidden>
              <line x1="1" y1="4" x2="23" y2="4" stroke={item.color} strokeWidth="3.5" strokeLinecap="round" />
            </svg>
            {item.label}
          </li>
        ))}
        <li className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <circle cx="8" cy="8" r="6" fill="#ecfdf5" stroke="#6ee7b7" strokeWidth="1.5" />
          </svg>
          No interaction
        </li>
        <li className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <circle cx="8" cy="8" r="6" fill="#fff1f2" stroke="#ef4444" strokeWidth="1.5" />
          </svg>
          Flagged drug
        </li>
      </ul>
    </section>
  );
}
