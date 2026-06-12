const SYMPTOM_DETAILS: Record<string, { description: string }> = {
  Nausea: {
    description: "A feeling of sickness with an urge to vomit, commonly linked to medication side effects or drug interactions.",
  },
  Vomiting: {
    description: "Forceful expulsion of stomach contents; may worsen when interacting medications affect the gastrointestinal tract.",
  },
  Dizziness: {
    description: "A sensation of unsteadiness or lightheadedness that can result from combined CNS or cardiovascular effects.",
  },
  Fatigue: {
    description: "Unusual tiredness or lack of energy that may occur when medications have overlapping sedative or metabolic effects.",
  },
  Headache: {
    description: "Head pain that may arise from vascular changes or neurological side effects of combined therapies.",
  },
  Anxiety: {
    description: "Increased nervousness or unease that can occur with serotonergic or stimulant medication interactions.",
  },
};

const FEATURED_SYMPTOMS = ["Nausea", "Vomiting"];

interface SymptomsPanelProps {
  symptoms: string[];
}

function normalizeSymptom(s: string): string {
  return s.trim().toLowerCase();
}

function resolveDisplaySymptoms(symptoms: string[]): string[] {
  const normalized = symptoms.map((s) => s.trim());
  const featured: string[] = [];
  const others: string[] = [];

  for (const name of FEATURED_SYMPTOMS) {
    const match = normalized.find((s) => normalizeSymptom(s) === normalizeSymptom(name));
    if (match) featured.push(match);
  }

  for (const s of normalized) {
    const isFeatured = FEATURED_SYMPTOMS.some(
      (f) => normalizeSymptom(f) === normalizeSymptom(s)
    );
    if (!isFeatured) others.push(s);
  }

  if (featured.length > 0) {
    return [...featured, ...others].slice(0, 4);
  }

  return normalized.length > 0 ? normalized.slice(0, 4) : FEATURED_SYMPTOMS;
}

export function SymptomsPanel({ symptoms }: SymptomsPanelProps) {
  const displaySymptoms = resolveDisplaySymptoms(symptoms);

  return (
    <section
      className="animate-fade-in mt-6 rounded-xl border border-[var(--border)] bg-gray-50/80 p-5"
      aria-labelledby="associated-symptoms-heading"
      style={{ animationDelay: "150ms" }}
    >
      <h3
        id="associated-symptoms-heading"
        className="mb-1 text-sm font-semibold text-[var(--foreground)]"
      >
        Associated Symptoms
      </h3>
      <p className="mb-4 text-xs text-[var(--muted)]">
        Symptoms that may be linked to this medication interaction
      </p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {displaySymptoms.map((symptom) => {
          const details = SYMPTOM_DETAILS[symptom] ?? {
            description: "May be associated with this medication combination based on known adverse effect profiles.",
          };
          const isFeatured = FEATURED_SYMPTOMS.some(
            (f) => normalizeSymptom(f) === normalizeSymptom(symptom)
          );

          return (
            <li
              key={symptom}
              className={`rounded-lg border bg-white p-4 ${
                isFeatured ? "border-[var(--primary)]/25" : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isFeatured
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "bg-gray-100 text-[var(--muted)]"
                  }`}
                  aria-hidden
                >
                  {symptom.charAt(0)}
                </span>
                <span className="text-sm font-semibold text-[var(--foreground)]">{symptom}</span>
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-[var(--muted)]">{details.description}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
