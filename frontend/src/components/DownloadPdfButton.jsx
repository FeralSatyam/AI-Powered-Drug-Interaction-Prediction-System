import { generateMedicationReportPdf } from "@/lib/pdf/generateReport";
import { useCallback, useState } from "react";

export function DownloadPdfButton({
  reportData,
  isReady = false,
  className = "",
}) {
  const [state, setState] = useState("idle");

  const canDownload = isReady && !!reportData && state !== "loading";
  const isPending = !isReady || !reportData;

  const handleDownload = useCallback(async () => {
    if (!canDownload || !reportData) return;

    setState("loading");
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      generateMedicationReportPdf(reportData);
      setState("success");
      setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("idle");
    }
  }, [canDownload, reportData]);

  const statusLabel = state === "loading"
    ? "Generating PDF report"
    : state === "success"
      ? "PDF downloaded successfully"
      : isReady
        ? "Ready to download PDF report"
        : "PDF not ready — add at least 2 medications first";

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={!canDownload && state !== "success"}
      aria-busy={state === "loading"}
      aria-disabled={isPending}
      aria-label={statusLabel}
      data-ready={isReady && state === "idle" ? "true" : "false"}
      className={[
        "download-pdf-btn group relative inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-2.5",
        "rounded-xl px-5 py-3 text-sm font-semibold",
        "transition-all duration-[250ms] ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        state === "success"
          ? "download-pdf-btn--success cursor-default"
          : state === "loading"
            ? "download-pdf-btn--loading"
            : isReady
              ? "download-pdf-btn--ready cursor-pointer"
              : "download-pdf-btn--pending cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {state === "loading" ? (
        <>
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="hidden sm:inline">Generating…</span>
        </>
      ) : state === "success" ? (
        <>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="hidden sm:inline">Downloaded</span>
        </>
      ) : (
        <>
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 10.5v6m0 0l-3-3m3 3l3-3M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12M12 16.5V3.75"
            />
          </svg>
          <span className="flex flex-col items-start leading-tight sm:flex-row sm:items-center sm:gap-0">
            <span>Download PDF</span>
            {isReady && (
              <span className="hidden text-[10px] font-medium opacity-90 sm:ml-1.5 sm:inline sm:text-xs">
                · Ready
              </span>
            )}
          </span>
        </>
      )}

      {isReady && state === "idle" && (
        <span
          className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-[var(--cta-ready-bg)]"
          aria-hidden
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300 opacity-75" />
          <span className="absolute inset-0 rounded-full bg-emerald-400" />
        </span>
      )}
    </button>
  );
}
