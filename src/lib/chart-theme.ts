// Shared, presentation-only color tokens for dashboard charts and accents.
// (UI constants — no business logic.)

export const CHART_COLORS = {
  blue: "#3b82f6",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  green: "#22c55e",
  orange: "#f97316",
  purple: "#8b5cf6",
  yellow: "#eab308",
  slate: "#94a3b8",
} as const;

export type AccentKey =
  | "primary"
  | "revenue"
  | "cost"
  | "profit"
  | "pipeline"
  | "transfer"
  | "success"
  | "warning"
  | "danger";

// Tailwind class fragments for accent surfaces (icon chips, bars, dots).
export const ACCENTS: Record<AccentKey, { icon: string; dot: string; text: string }> = {
  primary: { icon: "bg-blue-50 text-blue-600", dot: "bg-blue-500", text: "text-blue-600" },
  revenue: { icon: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", text: "text-emerald-600" },
  cost: { icon: "bg-orange-50 text-orange-600", dot: "bg-orange-500", text: "text-orange-600" },
  profit: { icon: "bg-blue-50 text-blue-600", dot: "bg-blue-500", text: "text-blue-600" },
  pipeline: { icon: "bg-purple-50 text-purple-600", dot: "bg-purple-500", text: "text-purple-600" },
  transfer: { icon: "bg-amber-50 text-amber-600", dot: "bg-amber-500", text: "text-amber-600" },
  success: { icon: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", text: "text-emerald-600" },
  warning: { icon: "bg-amber-50 text-amber-600", dot: "bg-amber-500", text: "text-amber-600" },
  danger: { icon: "bg-red-50 text-red-600", dot: "bg-red-500", text: "text-red-600" },
};
