import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge conditional class names and resolve Tailwind conflicts (last wins).
// Used by every shadcn/ui primitive.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
