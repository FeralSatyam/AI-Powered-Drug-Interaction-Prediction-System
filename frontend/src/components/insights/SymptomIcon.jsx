const SYMPTOM_ICONS = {
  Anxiety: { emoji: "😰", label: "Anxiety" },
  Vomiting: { emoji: "🤮", label: "Vomiting" },
  Dizziness: { emoji: "😵‍💫", label: "Dizziness" },
  Fatigue: { emoji: "😴", label: "Fatigue" },
  Headache: { emoji: "🤕", label: "Headache" },
  Rash: { emoji: "🔴", label: "Rash" },
  Diarrhea: { emoji: "💧", label: "Diarrhea" },
  Constipation: { emoji: "⏸️", label: "Constipation" },
  "Abdominal Pain": { emoji: "🫃", label: "Abdominal pain" },
  Insomnia: { emoji: "🌙", label: "Insomnia" },
  Confusion: { emoji: "❓", label: "Confusion" },
  "Muscle Pain": { emoji: "💪", label: "Muscle pain" },
  Cough: { emoji: "😷", label: "Cough" },
  "Shortness of Breath": { emoji: "🫁", label: "Shortness of breath" },
  Palpitations: { emoji: "💓", label: "Palpitations" },
  Swelling: { emoji: "🦶", label: "Swelling" },
  Itching: { emoji: "✋", label: "Itching" },
  Fever: { emoji: "🌡️", label: "Fever" },
  "Chest Pain": { emoji: "❤️‍🩹", label: "Chest pain" },
  "Dry Mouth": { emoji: "👄", label: "Dry mouth" },
};

export function SymptomIcon({ symptom, pulsing = false, delay = 0 }) {
  const config = SYMPTOM_ICONS[symptom] ?? { emoji: "⚕️", label: symptom };

  return (
    <span
      className={`inline-flex flex-col items-center gap-1 rounded-xl bg-white/60 px-3 py-2 backdrop-blur-sm ${
        pulsing ? "animate-symptom-pulse" : ""
      }`}
      style={{ animationDelay: `${delay}ms` }}
      title={config.label}
    >
      <span className="text-xl leading-none" role="img" aria-label={config.label}>
        {config.emoji}
      </span>
      <span className="text-[10px] font-medium text-[var(--muted)]">{config.label}</span>
    </span>
  );
}
