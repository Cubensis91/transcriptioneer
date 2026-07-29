import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins conditional class names and resolves conflicting Tailwind utilities (e.g. `p-2 p-4` -> `p-4`). */
export function cn(...values: ClassValue[]): string {
  return twMerge(clsx(values));
}
