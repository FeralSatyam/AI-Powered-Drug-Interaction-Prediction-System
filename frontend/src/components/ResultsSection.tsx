import { MostLikelyCauseVisual } from "@/components/insights/MostLikelyCauseVisual";
import { InteractionList } from "@/components/results/InteractionCard";
import { ReasoningBlock } from "@/components/results/ReasoningBlock";
import { RecommendationList } from "@/components/results/RecommendationList";
import { RiskHeroCard } from "@/components/results/RiskHeroCard";
import { buildPreviewAnalysis } from "@/lib/analysis/insights";
import type { AnalysisResult } from "@/lib/types";

interface ResultsSectionProps {
  result: AnalysisResult;
  medications: string[];
  symptoms: string[];
  onEdit: () => void;
  onNewAnalysis: () => void;
}

export function ResultsSection({
  result,
  medications,
  symptoms,
  onEdit,
  onNewAnalysis,
}: ResultsSectionProps) {
  const preview = buildPreviewAnalysis(medications, symptoms);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        >
          Edit inputs
        </button>
        <button
          type="button"
          onClick={onNewAnalysis}
          className="rounded-lg border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
        >
          New analysis
        </button>
      </div>

      <RiskHeroCard
        level={result.overallRisk}
        riskScore={result.riskScore}
        confidence={result.confidence}
      />

      {preview && (
        <MostLikelyCauseVisual
          insights={preview.insights}
          autoExpandPrimary
        />
      )}

      <InteractionList interactions={result.interactions} />
      <ReasoningBlock reasoning={result.reasoning} />
      <RecommendationList recommendations={result.recommendations} />

      <p className="text-center text-xs text-[var(--muted)]">
        Decision support only. Not a substitute for clinical judgment.
      </p>
    </div>
  );
}
