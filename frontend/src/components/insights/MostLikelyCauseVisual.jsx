import { CauseInsightCard } from "@/components/insights/CauseInsightCard";

export function MostLikelyCauseVisual({
  insights,
  autoExpandPrimary = true,
  title = "Most Likely Cause",
}) {
  if (insights.length === 0) {
    return (
      <section className="glass-card rounded-2xl border border-white/50 p-8 text-center shadow-lg">
        <p className="text-[var(--muted)]">
          No significant medication interactions or side-effect correlations detected yet.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="likely-cause-heading">
      <h2
        id="likely-cause-heading"
        className="mb-5 text-xl font-semibold tracking-tight text-[var(--foreground)]"
      >
        {title}
      </h2>
      <div className="space-y-5">
        {insights.map((insight, index) => (
          <CauseInsightCard
            key={insight.id}
            insight={insight}
            index={index}
            isPrimary={index === 0}
            autoExpand={autoExpandPrimary && index === 0}
          />
        ))}
      </div>
    </section>
  );
}
