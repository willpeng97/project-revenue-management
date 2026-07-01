import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";

export function ProgressCard({
  name,
  valueLabel,
  targetLabel,
  percent,
}: {
  name: string;
  valueLabel: string;
  targetLabel: string;
  percent: number;
}) {
  const clamped = Math.min(percent, 100);
  const reached = percent >= 100;
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <Avatar name={name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          <p className="text-xs text-muted-foreground">
            {valueLabel} / 目標 {targetLabel}
          </p>
        </div>
        <span className={cn("text-sm font-semibold", reached ? "text-emerald-600" : "text-foreground")}>
          {percent.toFixed(0)}%
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            reached ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"
          )}
          style={{ width: `${Math.max(clamped, 3)}%` }}
        />
      </div>
    </div>
  );
}
