import type { CauseInsight } from "@/lib/types";

export function resolveMedicinePair(
  insight: CauseInsight,
  allMedications: string[]
): [string, string] {
  if (insight.medications.length >= 2) {
    return [insight.medications[0], insight.medications[1]];
  }

  const medA = insight.medications[0] ?? allMedications[0] ?? "Medicine A";
  const medB =
    allMedications.find((m) => m !== medA) ??
    allMedications[1] ??
    "Medicine B";

  return [medA, medB];
}
