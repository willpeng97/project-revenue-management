"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENTS, ACCENT_HEX, type AccentKey } from "@/lib/chart-theme";
import { Sparkline } from "./charts/sparkline";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsKpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "primary",
  deltaPct,
  spark,
  sparkColor,
  loading = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent?: AccentKey;
  deltaPct?: number;
  spark?: number[];
  sparkColor?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="mt-4 h-4 w-20" />
        <Skeleton className="mt-2 h-8 w-32" />
        <Skeleton className="mt-3 h-10 w-full" />
      </div>
    );
  }

  const up = (deltaPct ?? 0) >= 0;
  const TrendIcon = up ? TrendingUp : TrendingDown;

  return (
    <div className="group rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ACCENTS[accent].icon)}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        {deltaPct !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}
          >
            <TrendIcon className="h-3 w-3" />
            {Math.abs(deltaPct).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      {spark && spark.length > 1 && (
        <div className="mt-3">
          <Sparkline data={spark} color={sparkColor ?? ACCENT_HEX[accent]} />
        </div>
      )}
    </div>
  );
}
