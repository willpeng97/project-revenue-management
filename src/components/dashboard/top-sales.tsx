"use client";

import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface SalesRank {
  name: string;
  amount: number;
}

const RANK_STYLES = [
  "bg-amber-100 text-amber-700",
  "bg-slate-200 text-slate-600",
  "bg-orange-100 text-orange-700",
];

export function TopSales({ data }: { data: SalesRank[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <ul className="space-y-3">
      {data.map((row, i) => (
        <li key={row.name} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2.5">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                  i < 3 ? RANK_STYLES[i] : "bg-slate-100 text-slate-500"
                )}
              >
                {i + 1}
              </span>
              <span className="font-medium text-foreground">{row.name}</span>
            </span>
            <span className="font-semibold text-foreground">{formatCurrency(row.amount)}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${Math.max((row.amount / max) * 100, 4)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
