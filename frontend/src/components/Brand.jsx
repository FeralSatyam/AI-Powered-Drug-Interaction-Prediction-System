import { HeartPulse } from "lucide-react";

import { cn } from "@/lib/utils";

// The product wordmark: a teal rounded tile with a heart-pulse glyph beside the
// name. Reused on the auth screens and in the app header.
export function Brand({ size = "md", className }) {
  const mark = size === "sm" ? "size-8" : "size-9";
  const icon = size === "sm" ? "size-4" : "size-[18px]";
  const title = size === "sm" ? "text-sm" : "text-[15px]";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-[9px] bg-primary text-primary-foreground shadow-sm",
          mark
        )}
      >
        <HeartPulse className={icon} strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className={cn("truncate font-semibold tracking-tight text-[var(--foreground)]", title)}>
          Medication Interaction Analyzer
        </p>
        <p className="truncate text-[11px] text-[var(--muted)]">
          Clinical decision support
        </p>
      </div>
    </div>
  );
}
