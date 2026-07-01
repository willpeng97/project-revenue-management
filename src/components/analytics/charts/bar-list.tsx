"use client";

import { formatMoneyCompact } from "@/lib/analytics/selectors";

export interface BarListItem {
  label: string;
  value: number;
  sub?: string;
}

export function BarList({
  items,
  color = "#3b82f6",
  valueFormatter = formatMoneyCompact,
  max: maxProp,
}: {
  items: BarListItem[];
  color?: string;
  valueFormatter?: (v: number) => string;
  max?: number;
}) {
  const max = maxProp ?? Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="truncate font-medium text-foreground">{item.label}</span>
            <span className="shrink-0 text-muted-foreground">{valueFormatter(item.value)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max((item.value / max) * 100, 3)}%`, backgroundColor: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
