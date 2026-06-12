import { buildPreviewAnalysis } from "@/lib/analysis/insights";
import { useEffect, useRef, useState } from "react";

export function useMedicationPreview({
  medications,
  symptoms,
  debounceMs = 700,
  autoOpenModal = true,
}) {
  const [preview, setPreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const prevInteractionCount = useRef(0);
  const prevSymptomCount = useRef(0);
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (medications.length < 2) {
      setPreview(null);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    const timer = setTimeout(() => {
      const result = buildPreviewAnalysis(medications, symptoms);
      setPreview(result);
      setIsAnalyzing(false);

      if (result && result.hasSignificantFindings && autoOpenModal) {
        const newInteractionCount = result.interactions.length;
        const symptomsJustAdded =
          prevSymptomCount.current === 0 && symptoms.length > 0;
        const shouldOpen =
          isFirstRun.current ||
          newInteractionCount > prevInteractionCount.current ||
          symptomsJustAdded;

        if (shouldOpen) {
          setIsModalOpen(true);
        }

        prevInteractionCount.current = newInteractionCount;
        prevSymptomCount.current = symptoms.length;
        isFirstRun.current = false;
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [medications, symptoms, debounceMs, autoOpenModal]);

  function openModal() {
    if (preview?.hasSignificantFindings) {
      setIsModalOpen(true);
    }
  }

  function closeModal() {
    setIsModalOpen(false);
  }

  return {
    preview,
    isModalOpen,
    isAnalyzing,
    openModal,
    closeModal,
  };
}
