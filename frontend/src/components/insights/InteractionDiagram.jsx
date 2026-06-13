function MedicineCircle({ label, name }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--primary)]/25 bg-white shadow-sm sm:h-28 sm:w-28"
        aria-hidden
      >
        <svg
          className="h-8 w-8 text-[var(--primary)] sm:h-9 sm:w-9"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.5 15.3l-1.5 4.5-3-1.5-3 1.5-1.5-4.5"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">{label}</p>
        <p className="mt-0.5 max-w-[120px] text-sm font-semibold leading-tight text-[var(--foreground)] sm:max-w-[140px]">
          {name}
        </p>
      </div>
    </div>
  );
}

const CONNECTOR_CONFIG = {
  low: {
    message: "Possible interaction affecting you",
    lineClass: "bg-emerald-400",
    nodeBorderClass: "border-emerald-400",
    pillClass: "border-emerald-200 bg-emerald-50 text-emerald-800",
    showRiskLabel: false,
  },
  moderate: {
    message: "Possible interaction affecting you",
    lineClass: "bg-amber-400",
    nodeBorderClass: "border-amber-400",
    pillClass: "border-amber-200 bg-amber-50 text-amber-900",
    showRiskLabel: false,
  },
  high: {
    message: "Potential harmful interaction",
    lineClass: "bg-red-500",
    nodeBorderClass: "border-red-500",
    pillClass: "border-red-200 bg-red-50 text-red-800",
    showRiskLabel: true,
  },
};

function InteractionConnector({ severity }) {
  const config = CONNECTOR_CONFIG[severity];

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center px-2 sm:px-4">
      <div className="flex w-full items-center">
        <div className={`h-0.5 flex-1 rounded-full ${config.lineClass}`} aria-hidden />
        <div className="mx-1 shrink-0 sm:mx-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white ${config.nodeBorderClass}`}
            aria-hidden
          >
            {config.showRiskLabel ? (
              <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <div className={`h-2 w-2 rounded-full ${config.lineClass}`} />
            )}
          </div>
        </div>
        <div className={`h-0.5 flex-1 rounded-full ${config.lineClass}`} aria-hidden />
      </div>

      <div className={`mt-3 rounded-lg border px-3 py-2 text-center ${config.pillClass}`}>
        {config.showRiskLabel && (
          <p className="mb-1 flex items-center justify-center gap-1 text-xs font-bold uppercase tracking-wide text-red-700">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Risk Detected
          </p>
        )}
        <p className="text-xs font-medium leading-snug sm:text-sm">{config.message}</p>
      </div>
    </div>
  );
}

export function InteractionDiagram({
  medicineA,
  medicineB,
  severity,
}) {
  return (
    <div
      className="animate-fade-in flex items-start justify-between gap-2 sm:gap-4"
      role="img"
      aria-label={`Interaction between ${medicineA} and ${medicineB}. ${CONNECTOR_CONFIG[severity].message}.`}
    >
      <MedicineCircle label="Medicine A" name={medicineA} />
      <InteractionConnector severity={severity} />
      <MedicineCircle label="Medicine B" name={medicineB} />
    </div>
  );
}
