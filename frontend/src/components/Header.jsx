import { DownloadPdfButton } from "@/components/DownloadPdfButton";

export function Header({ reportData, isReportReady = false }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-6 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1 pr-2">
            <p className="truncate text-sm font-semibold tracking-tight text-[var(--foreground)] sm:text-base">
              Medication Interaction Analyzer
            </p>
            <p className="hidden text-xs text-[var(--muted)] sm:block">
              Clinical decision support
            </p>
          </div>

          <div className="shrink-0" style={{ marginLeft: "12px" }}>
            <DownloadPdfButton reportData={reportData} isReady={isReportReady} />
          </div>
        </div>
      </header>
      {/* Section removed: "Understand your medication interactions" */}
    </>
  );
}
