import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Header } from "@/components/Header";
import { MedicationSection } from "@/components/MedicationSection";
import { PatientHistoryPanel } from "@/components/PatientHistoryPanel";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { usePatients } from "@/context/PatientContext";
import { buildPreviewAnalysis, getPrimaryInsight } from "@/lib/analysis/insights";
import { resolveMedicinePair } from "@/lib/resolveMedicinePair";
import { severityToRisk } from "@/lib/risk";

export function AnalyzerApp() {
  const {
    currentPatient,
    currentPatientId,
    medications,
    setMedications,
    persistMedications,
    saveAnalysis,
  } = usePatients();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  // Avoids re-recording history for a medication set we just saved.
  const lastSavedSignature = useRef(null);

  const preview = medications.length >= 2 ? buildPreviewAnalysis(medications) : null;
  const primaryInsight = getPrimaryInsight(preview, medications);
  const isReportReady = medications.length >= 2 && !!primaryInsight && !isAnalyzing;

  const reportData = useMemo(() => {
    if (!preview || !primaryInsight) return null;
    const [medicineA, medicineB] = resolveMedicinePair(primaryInsight, medications);
    return { medications, insight: primaryInsight, preview, medicineA, medicineB };
  }, [medications, preview, primaryInsight]);

  // Reset the analyzing flag and saved-signature when the patient changes.
  useEffect(() => {
    lastSavedSignature.current = null;
    setIsAnalyzing(false);
  }, [currentPatientId]);

  useEffect(() => {
    if (medications.length < 2) {
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      setPreviewKey((k) => k + 1);

      // Record this combination once per distinct medication set.
      const signature = [...medications].sort().join("|");
      if (primaryInsight && signature !== lastSavedSignature.current) {
        lastSavedSignature.current = signature;
        saveAnalysis({
          medications,
          riskLevel: severityToRisk(primaryInsight.severity),
          result: {
            headline: primaryInsight.headline,
            severity: primaryInsight.severity,
            likelihood: primaryInsight.likelihood,
            symptoms: primaryInsight.symptoms,
          },
        });
      }
    }, 600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medications]);

  const addMedication = useCallback(
    (med) => {
      if (!currentPatientId) {
        toast.error("Select or add a patient first");
        return;
      }
      if (medications.includes(med)) return;
      const next = [...medications, med];
      setMedications(next);
      persistMedications(next);
    },
    [medications, currentPatientId, setMedications, persistMedications]
  );

  const removeMedication = useCallback(
    (med) => {
      const next = medications.filter((m) => m !== med);
      setMedications(next);
      persistMedications(next);
    },
    [medications, setMedications, persistMedications]
  );

  return (
    <>
      <Header reportData={reportData} isReportReady={isReportReady} />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {!currentPatient ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-dashed border-[var(--border)]">
              <UserPlus className="size-6 text-[var(--muted)]" />
            </div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Select a patient to begin
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Use the patient menu in the top bar to pick or add a patient.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <MedicationSection
              medications={medications}
              onAdd={addMedication}
              onRemove={removeMedication}
            />

            {medications.length < 2 && (
              <div className="rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-12 text-center">
                <p className="text-sm font-medium text-[var(--muted)]">
                  Add at least 2 medications to see how their combination may
                  affect {currentPatient.name.split(" ")[0]}
                </p>
              </div>
            )}

            {medications.length >= 2 && primaryInsight && (
              <ResultsPanel
                key={previewKey}
                medications={medications}
                preview={preview}
                isAnalyzing={isAnalyzing}
              />
            )}

            <PatientHistoryPanel />
          </div>
        )}
      </main>
    </>
  );
}
