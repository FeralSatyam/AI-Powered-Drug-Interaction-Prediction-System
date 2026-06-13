import { useMemo } from "react";
import { Loader2, ScanSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/Chip";
import { SearchCombobox } from "@/components/ui/SearchCombobox";
import { searchDatasetMedications } from "@/lib/data/datasetMedications";

export function MedicationSection({
  medications,
  onAdd,
  onRemove,
  onClear,
  onAnalyze,
  isAnalyzing = false,
  disabled = false,
  drugCatalog = null,
}) {
  const canAnalyze = medications.length >= 2 && !isAnalyzing;

  // Default search uses dataset-confirmed drugs only.
  // If the ML catalog returns human-readable names (not STITCH IDs like CIDxxxxxxxxx),
  // use those instead - the dataset list acts as the fallback in either case.
  const onSearch = useMemo(() => {
    if (Array.isArray(drugCatalog) && drugCatalog.length > 0) {
      const hasStitchIds = drugCatalog[0]?.startsWith?.("CID");
      if (!hasStitchIds) {
        // Catalog has readable names - search against it
        return (query) => {
          const q = query.trim().toLowerCase();
          if (!q) return drugCatalog.slice(0, 20);
          const matches = drugCatalog.filter((n) => n.toLowerCase().includes(q));
          return matches.sort((a, b) => {
            const aP = a.toLowerCase().startsWith(q) ? 0 : 1;
            const bP = b.toLowerCase().startsWith(q) ? 0 : 1;
            return aP - bP || a.localeCompare(b);
          });
        };
      }
    }
    // Catalog unavailable or returns STITCH IDs: use dataset-confirmed drug names
    return searchDatasetMedications;
  }, [drugCatalog]);

  return (
    <section
      className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm"
      aria-labelledby="medications-heading"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h2 id="medications-heading" className="text-lg font-semibold text-[var(--foreground)]">
          Medications
        </h2>
        <span className="text-sm text-[var(--muted)]">2+ required</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchCombobox
            label="Search medication"
            placeholder="Search medication name..."
            options={medications}
            onSearch={onSearch}
            onSelect={onAdd}
            disabled={disabled}
          />
        </div>
      </div>

      {medications.length > 0 && (
        <div className="mt-5">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--muted)]">Selected</p>
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-[var(--muted)] underline-offset-2 hover:text-red-500 hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {medications.map((med) => (
              <Chip key={med} label={med} onRemove={() => onRemove(med)} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2 border-t border-[var(--border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--muted)]" role="status">
          {medications.length < 2
            ? `Add ${2 - medications.length} more medication${
                2 - medications.length === 1 ? "" : "s"
              } to analyze`
            : `${medications.length} medications ready - press Analyze`}
        </p>
        <Button
          type="button"
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className="w-full sm:w-auto"
        >
          {isAnalyzing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ScanSearch className="size-4" />
          )}
          {isAnalyzing ? "Analyzing…" : "Analyze interactions"}
        </Button>
      </div>
    </section>
  );
}
