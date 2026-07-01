"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalyticsFilters } from "@/lib/analytics/filter-context";
import { type DatePreset } from "@/lib/analytics/selectors";
import { ExportButton } from "./export-button";

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: "month", label: "本月" },
  { key: "quarter", label: "本季" },
  { key: "year", label: "本年" },
  { key: "custom", label: "自訂" },
];

export function AnalyticsHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { filters, setPreset, refresh } = useAnalyticsFilters();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Business Intelligence</p>
        <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filters.preset === p.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          onClick={refresh}
          aria-label="重新整理"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          重新整理
        </button>
        <ExportButton />
      </div>
    </div>
  );
}
