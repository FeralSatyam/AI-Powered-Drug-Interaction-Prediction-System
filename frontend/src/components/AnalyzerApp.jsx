import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScanSearch, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { DemoPanel } from "@/components/DemoPanel";
import { Header } from "@/components/Header";
import { MedicalChatbot } from "@/components/MedicalChatbot";
import { SideEffectsPanel } from "@/components/SideEffectsPanel";
import { MedicationSection } from "@/components/MedicationSection";
import { PatientHistoryPanel } from "@/components/PatientHistoryPanel";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { usePatients } from "@/context/PatientContext";
import { buildPreviewAnalysis, getPrimaryInsight } from "@/lib/analysis/insights";
import { mlResultToPreview } from "@/lib/analysis/adapter";
import { predictInteractions, fetchDrugCatalog } from "@/lib/api/analysis";
import { resolveMedicinePair } from "@/lib/resolveMedicinePair";
import { severityToRisk } from "@/lib/risk";

// Module-level catalog cache - fetched once per session.
let _catalogCache = null;
let _catalogFetching = false;

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
  // The committed analysis result - only set when Analyze is pressed.
  const [analysis, setAnalysis] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [analysisSource, setAnalysisSource] = useState(null); // 'ml' | 'fallback'
  const [drugCatalog, setDrugCatalog] = useState(null);
  // Avoids re-recording history when re-analyzing the same medication set.
  const lastSavedSignature = useRef(null);

  const signature = useMemo(
    () => [...medications].sort().join("|"),
    [medications]
  );

  const reportData = useMemo(() => {
    if (!analysis) return null;
    const { preview, primaryInsight, medications: meds } = analysis;
    const [medicineA, medicineB] = resolveMedicinePair(primaryInsight, meds);
    return { medications: meds, insight: primaryInsight, preview, medicineA, medicineB };
  }, [analysis]);

  const isReportReady = !!analysis && !isAnalyzing;
  const interactions = analysis?.preview?.interactions ?? [];
  const confidence   = analysis?.preview?.confidence ?? 0;

  // Fetch drug catalog once on mount (best-effort; failure is silent).
  useEffect(() => {
    if (_catalogCache || _catalogFetching) {
      if (_catalogCache) setDrugCatalog(_catalogCache);
      return;
    }
    _catalogFetching = true;
    fetchDrugCatalog()
      .then((catalog) => {
        _catalogCache = catalog;
        setDrugCatalog(catalog);
      })
      .catch(() => {})
      .finally(() => { _catalogFetching = false; });
  }, []);

  // Clear stale results whenever the medication set or patient changes, so the
  // doctor always re-runs Analyze against the current list.
  useEffect(() => {
    setAnalysis(null);
    setIsAnalyzing(false);
    setAnalysisSource(null);
  }, [signature, currentPatientId]);

  const runAnalysis = useCallback(async () => {
    if (medications.length < 2 || isAnalyzing) return;

    setIsAnalyzing(true);
    const snapshot = [...medications];

    let preview;
    let source;

    try {
      const mlResult = await predictInteractions(snapshot);
      preview = mlResultToPreview(mlResult, snapshot);
      source  = "ml";
    } catch {
      preview = buildPreviewAnalysis(snapshot);
      source  = "fallback";
      toast.warning("Offline estimate - ML service unavailable", {
        id:       "ml-fallback",
        duration: 5000,
      });
    }

    const primaryInsight = getPrimaryInsight(preview, snapshot);
    setAnalysis({ preview, primaryInsight, medications: snapshot, source });
    setAnalysisSource(source);
    setPreviewKey((k) => k + 1);
    setIsAnalyzing(false);

    // Record the run once per distinct medication set.
    const sig = [...snapshot].sort().join("|");
    if (primaryInsight && sig !== lastSavedSignature.current) {
      lastSavedSignature.current = sig;
      saveAnalysis({
        medications: snapshot,
        riskLevel: severityToRisk(primaryInsight.severity),
        result: {
          headline:   primaryInsight.headline,
          severity:   primaryInsight.severity,
          likelihood: primaryInsight.likelihood,
          symptoms:   primaryInsight.symptoms,
          source,
        },
      });
    }
  }, [medications, isAnalyzing, saveAnalysis]);

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

  const clearMedications = useCallback(() => {
    setMedications([]);
    persistMedications([]);
  }, [setMedications, persistMedications]);

  const loadDemoMedications = useCallback(
    (names) => {
      if (!currentPatientId) {
        toast.error("Select or add a patient first");
        return;
      }
      setMedications(names);
      persistMedications(names);
    },
    [currentPatientId, setMedications, persistMedications]
  );

  return (
    <>
      <Header reportData={reportData} isReportReady={isReportReady} />
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
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
          <div className="grid gap-5 lg:grid-cols-[300px_1fr_280px]">
            {/* ── Left: demo panel ── */}
            <div>
              <DemoPanel onLoad={loadDemoMedications} currentMeds={medications} />
            </div>

            {/* ── Center: analyzer ── */}
            <div className="min-w-0 space-y-5">
              <MedicationSection
                medications={medications}
                onAdd={addMedication}
                onRemove={removeMedication}
                onClear={clearMedications}
                onAnalyze={runAnalysis}
                isAnalyzing={isAnalyzing}
                drugCatalog={drugCatalog}
              />

              {isAnalyzing && (
                <ResultsPanel medications={medications} preview={null} isAnalyzing />
              )}

              {!isAnalyzing && analysis && (
                <ResultsPanel
                  key={previewKey}
                  medications={analysis.medications}
                  preview={analysis.preview}
                  isAnalyzing={false}
                />
              )}

              {!isAnalyzing && !analysis && (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-12 text-center">
                  {medications.length < 2 ? (
                    <p className="text-sm font-medium text-[var(--muted)]">
                      Add at least 2 medications to see how their combination may
                      affect {currentPatient.name.split(" ")[0]}
                    </p>
                  ) : (
                    <p className="flex items-center justify-center gap-2 text-sm font-medium text-[var(--muted)]">
                      <ScanSearch className="size-4" />
                      Press Analyze to check interactions for{" "}
                      {currentPatient.name.split(" ")[0]}
                    </p>
                  )}
                </div>
              )}

              <PatientHistoryPanel />
            </div>

            {/* ── Right: polypharmacy risk score ── */}
            <div>
              <SideEffectsPanel interactions={interactions} confidence={confidence} />
            </div>
          </div>
        )}
      </main>
      <MedicalChatbot />
    </>
  );
}
