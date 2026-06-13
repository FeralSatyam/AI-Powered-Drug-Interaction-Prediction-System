import { AccountMenu } from "@/components/AccountMenu";
import { Brand } from "@/components/Brand";
import { DownloadPdfButton } from "@/components/DownloadPdfButton";
import { PatientSwitcher } from "@/components/PatientSwitcher";

export function Header({ reportData, isReportReady = false }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/95 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Brand size="sm" className="min-w-0 flex-1" />
        <div className="flex shrink-0 items-center gap-2">
          <PatientSwitcher />
          <DownloadPdfButton reportData={reportData} isReady={isReportReady} />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
