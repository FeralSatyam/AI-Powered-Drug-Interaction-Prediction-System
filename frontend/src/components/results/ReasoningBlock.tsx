interface ReasoningBlockProps {
  reasoning: string;
}

export function ReasoningBlock({ reasoning }: ReasoningBlockProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm" aria-labelledby="reasoning-heading">
      <h2 id="reasoning-heading" className="mb-3 text-lg font-semibold text-[var(--foreground)]">
        Why this risk was detected
      </h2>
      <p className="max-w-prose text-[15px] leading-relaxed text-[var(--foreground)]">
        {reasoning}
      </p>
    </section>
  );
}
