export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type InteractionSeverity = "low" | "moderate" | "high" | "critical";

export interface CauseRanking {
  rank: number;
  label: string;
  likelihood: number;
}

export interface DetectedInteraction {
  medications: string[];
  associatedSymptoms: string[];
  severity: InteractionSeverity;
}

export interface AnalysisResult {
  overallRisk: RiskLevel;
  riskScore: number;
  confidence: number;
  rankings: CauseRanking[];
  interactions: DetectedInteraction[];
  reasoning: string;
  recommendations: string[];
}

export interface AnalysisRequest {
  medications: string[];
  symptoms: string[];
}

export type CauseInsightType = "interaction" | "side_effect" | "symptom_pattern";

export type VisualSeverity = "low" | "moderate" | "high";

export interface CauseInsight {
  id: string;
  rank: number;
  type: CauseInsightType;
  medications: string[];
  headline: string;
  symptoms: string[];
  severity: VisualSeverity;
  likelihood: number;
  confidence: number;
  shortExplanation: string;
  detailedExplanation: string;
}

export interface PreviewAnalysis {
  insights: CauseInsight[];
  interactions: DetectedInteraction[];
  confidence: number;
  hasSignificantFindings: boolean;
}
