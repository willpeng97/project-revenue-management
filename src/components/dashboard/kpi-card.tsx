import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENTS, type AccentKey } from "@/lib/chart-theme";

export interface KpiCardProps {
  label: string;
  value: string;
  secondary?: string;
  icon: LucideIcon;
  accent?: AccentKey;
  /** Optional badge text (e.g. a real, derived rate). */
  trendLabel?: string;
  /** Direction colours the badge; omit for a neutral badge. */
  trendDirection?: "up" | "down" | "neutral";
}

export function KpiCard({
  label,
  value,
  secondary,
  icon: Icon,
  accent = "primary",
  trendLabel,
  trendDirection = "neutral",
}: KpiCardProps) {
  const accentCls = ACCENTS[accent];
  const TrendIcon = trendDirection === "down" ? TrendingDown : TrendingUp;

  return (
    <div className="group rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accentCls.icon)}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        {trendLabel && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trendDirection === "up" && "bg-emerald-50 text-emerald-600",
              trendDirection === "down" && "bg-red-50 text-red-600",
              trendDirection === "neutral" && "bg-slate-100 text-slate-600"
            )}
          >
            {trendDirection !== "neutral" && <TrendIcon className="h-3 w-3" />}
            {trendLabel}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      {secondary && <p className="mt-1.5 text-xs text-muted-foreground">{secondary}</p>}
    </div>
  );
}
