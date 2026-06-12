import { Header } from "@/components/Header";
import { MostLikelyCauseHero } from "@/components/insights/MostLikelyCauseHero";
import { MedicationSection } from "@/components/MedicationSection";
import { buildPreviewAnalysis, getPrimaryInsight } from "@/lib/analysis/insights";
import { resolveMedicinePair } from "@/lib/resolveMedicinePair";
import { useCallback, useEffect, useMemo, useState } from "react";

export function AnalyzerApp() {
  const [medications, setMedications] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const preview = medications.length >= 2 ? buildPreviewAnalysis(medications) : null;
  const primaryInsight = getPrimaryInsight(preview, medications);
  const isReportReady = medications.length >= 2 && !!primaryInsight && !isAnalyzing;

  const reportData = useMemo(() => {
    if (!preview || !primaryInsight) return null;
    const [medicineA, medicineB] = resolveMedicinePair(primaryInsight, medications);
    return {
      medications,
      insight: primaryInsight,
      preview,
      medicineA,
      medicineB,
    };
  }, [medications, preview, primaryInsight]);

  useEffect(() => {
    if (medications.length < 2) {
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      setPreviewKey((k) => k + 1);
    }, 600);

    return () => clearTimeout(timer);
  }, [medications]);

  const addMedication = useCallback((med) => {
    setMedications((prev) => (prev.includes(med) ? prev : [...prev, med]));
  }, []);

  const removeMedication = useCallback((med) => {
    setMedications((prev) => prev.filter((m) => m !== med));
  }, []);

  return (
    <>
      <Header reportData={reportData} isReportReady={isReportReady} />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="space-y-6">
          <MedicationSection
            medications={medications}
            onAdd={addMedication}
            onRemove={removeMedication}
          />

          {medications.length < 2 && (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-12 text-center">
              <p className="text-sm font-medium text-[var(--muted)]">
                Add at least 2 medications to see how their combination may affect you
              </p>
            </div>
          )}

          {medications.length >= 2 && primaryInsight && (
            <MostLikelyCauseHero
              key={previewKey}
              insight={primaryInsight}
              allMedications={medications}
              isAnalyzing={isAnalyzing}
            />
          )}

          {medications.length >= 2 && !isAnalyzing && preview && preview.insights.length > 1 && (
            <section className="rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                Other possible combinations
              </h3>
              <ul className="space-y-2">
                {preview.insights.slice(1, 4).map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-[var(--border)] bg-gray-50 px-4 py-3 text-sm text-[var(--foreground)]"
                  >
                    {item.headline}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
