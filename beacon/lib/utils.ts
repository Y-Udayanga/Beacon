import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getTriageColor(level: number): {
  bg: string;
  text: string;
  border: string;
  glow: string;
} {
  const map: Record<number, { bg: string; text: string; border: string; glow: string }> = {
    5: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/50", glow: "shadow-red-500/30" },
    4: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/50", glow: "shadow-orange-500/30" },
    3: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50", glow: "shadow-amber-500/30" },
    2: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50", glow: "shadow-blue-500/30" },
    1: { bg: "bg-emerald-500/20", text: "text-emerald-400", border: "border-emerald-500/50", glow: "shadow-emerald-500/30" },
  };
  return map[level] ?? map[3];
}

export function getTriageLabel(level: number): string {
  const labels: Record<number, string> = {
    5: "Critical",
    4: "Severe",
    3: "Moderate",
    2: "Low",
    1: "Minimal",
  };
  return labels[level] ?? "Unknown";
}
