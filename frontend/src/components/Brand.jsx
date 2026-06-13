import { cn } from "@/lib/utils";

export function Brand({ size = "md", className }) {
  const title = size === "sm" ? "text-sm" : "text-[15px]";

  return (
    <div className={cn("flex items-center", className)}>
      <p className={cn("truncate font-semibold tracking-tight text-[var(--foreground)]", title)}>
        AI-Powered Drug Interaction Prediction System
      </p>
    </div>
  );
}
