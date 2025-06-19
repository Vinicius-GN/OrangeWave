import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility to merge Tailwind CSS class names with conflict resolution
// Combines conditional classes using clsx and resolves conflicting styles with twMerge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
