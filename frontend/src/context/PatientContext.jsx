import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";

import { patientsApi } from "@/lib/api/patients";

const PatientContext = createContext(null);

// Owns the doctor's patient roster and the active patient's working state
// (medication list + saved analysis history). The active patient's medications
// are the single source of truth the analyzer reads from and writes back to,
// so switching patients restores exactly what was last being checked.
export function PatientProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [currentPatientId, setCurrentPatientId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentPatient =
    patients.find((p) => p.id === currentPatientId) ?? null;

  // Load the roster once on mount and auto-select the most recent patient.
  useEffect(() => {
    let active = true;
    patientsApi
      .list()
      .then((data) => {
        if (!active) return;
        setPatients(data.patients);
        setCurrentPatientId((id) => id ?? data.patients[0]?.id ?? null);
      })
      .catch((err) => toast.error(err.message || "Could not load patients"))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // Pull history whenever the active patient changes.
  useEffect(() => {
    if (!currentPatientId) {
      setHistory([]);
      return;
    }
    let active = true;
    patientsApi
      .listHistory(currentPatientId)
      .then((data) => active && setHistory(data.history))
      .catch(() => active && setHistory([]));
    return () => {
      active = false;
    };
  }, [currentPatientId]);

  const selectPatient = useCallback((id) => setCurrentPatientId(id), []);

  const addPatient = useCallback(async (name) => {
    const data = await patientsApi.create({ name });
    setPatients((prev) => [data.patient, ...prev]);
    setCurrentPatientId(data.patient.id);
    return data.patient;
  }, []);

  const removePatient = useCallback(
    async (id) => {
      await patientsApi.remove(id);
      setPatients((prev) => prev.filter((p) => p.id !== id));
      setCurrentPatientId((current) =>
        current === id ? null : current
      );
    },
    []
  );

  // Replace the active patient's medication list and persist it.
  const setMedications = useCallback(
    (next) => {
      if (!currentPatientId) return;
      setPatients((prev) =>
        prev.map((p) =>
          p.id === currentPatientId
            ? {
                ...p,
                medications:
                  typeof next === "function" ? next(p.medications) : next,
              }
            : p
        )
      );
    },
    [currentPatientId]
  );

  // Persist the medication list to the server (fire-and-forget with a toast).
  const persistMedications = useCallback(
    (medications) => {
      if (!currentPatientId) return;
      patientsApi
        .update(currentPatientId, { medications })
        .catch((err) => toast.error(err.message || "Could not save medications"));
    },
    [currentPatientId]
  );

  const saveAnalysis = useCallback(
    async (entry) => {
      if (!currentPatientId) return;
      try {
        const data = await patientsApi.addHistory(currentPatientId, entry);
        setHistory((prev) => [data.entry, ...prev]);
      } catch (err) {
        toast.error(err.message || "Could not save analysis");
      }
    },
    [currentPatientId]
  );

  const value = {
    patients,
    currentPatient,
    currentPatientId,
    medications: currentPatient?.medications ?? [],
    history,
    isLoading,
    selectPatient,
    addPatient,
    removePatient,
    setMedications,
    persistMedications,
    saveAnalysis,
  };

  return (
    <PatientContext.Provider value={value}>{children}</PatientContext.Provider>
  );
}

export function usePatients() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatients must be used within a PatientProvider");
  return ctx;
}
