export function RecommendationList({ recommendations }) {
  if (recommendations.length === 0) return null;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm" aria-labelledby="recommendations-heading">
      <h2 id="recommendations-heading" className="mb-4 text-lg font-semibold text-[var(--foreground)]">
        Suggested next steps
      </h2>
      <ul className="space-y-3">
        {recommendations.map((rec) => (
          <li key={rec} className="flex gap-3 text-[15px] text-[var(--foreground)]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" aria-hidden />
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
