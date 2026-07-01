"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

export interface FunnelStage {
  label: string;
  count: number;
  amount: number;
  color: string;
}

export function PipelineFunnel({ stages }: { stages: FunnelStage[] }) {
  const max = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const width = Math.max((stage.count / max) * 100, stage.count > 0 ? 12 : 4);
        const conversion =
          i > 0 && stages[i - 1].count > 0
            ? Math.round((stage.count / stages[i - 1].count) * 100)
            : null;
        return (
          <div key={stage.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                {stage.label}
              </span>
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{stage.count}</span> 件 ·{" "}
                {formatCurrency(stage.amount)}
              </span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-lg bg-slate-100">
              <div
                className={cn("flex h-full items-center justify-end rounded-lg px-2 transition-all duration-500")}
                style={{ width: `${width}%`, backgroundColor: stage.color }}
              >
                {conversion !== null && (
                  <span className="text-[11px] font-medium text-white/90">{conversion}%</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
