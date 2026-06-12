import type { CauseRanking as CauseRankingType } from "@/lib/types";

interface CauseRankingProps {
  rankings: CauseRankingType[];
}

export function CauseRanking({ rankings }: CauseRankingProps) {
  if (rankings.length === 0) return null;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm" aria-labelledby="ranking-heading">
      <h2 id="ranking-heading" className="mb-5 text-lg font-semibold text-[var(--foreground)]">
        Most likely causes
      </h2>
      <ol className="space-y-5">
        {rankings.map((item, index) => (
          <li key={`${item.label}-${item.rank}`}>
            <div className="mb-2 flex items-baseline justify-between gap-4">
              <div className="flex items-baseline gap-2.5 min-w-0">
                <span className="shrink-0 text-sm font-medium text-[var(--muted)] tabular-nums">
                  {item.rank}.
                </span>
                <span
                  className={`truncate text-[15px] ${
                    index === 0 ? "font-semibold text-[var(--foreground)]" : "font-medium text-[var(--foreground)]"
                  }`}
                >
                  {item.label}
                  {index === 0 && (
                    <span className="ml-2 inline-flex rounded-md bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                      Primary suspect
                    </span>
                  )}
                </span>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--foreground)]">
                {item.likelihood}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  index === 0 ? "bg-[var(--primary)]" : "bg-gray-300"
                }`}
                style={{ width: `${item.likelihood}%` }}
                role="progressbar"
                aria-valuenow={item.likelihood}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${item.label} likelihood`}
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
