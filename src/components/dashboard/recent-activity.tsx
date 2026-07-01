"use client";

import { GitBranch, FileText, ArrowLeftRight, ClipboardList, LucideIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ACCENTS, type AccentKey } from "@/lib/chart-theme";

export type ActivityType = "pipeline" | "quotation" | "transfer" | "workorder";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  date: string;
}

const META: Record<ActivityType, { icon: LucideIcon; accent: AccentKey; verb: string }> = {
  pipeline: { icon: GitBranch, accent: "pipeline", verb: "建立商機" },
  quotation: { icon: FileText, accent: "primary", verb: "建立報價" },
  transfer: { icon: ArrowLeftRight, accent: "transfer", verb: "新增轉撥" },
  workorder: { icon: ClipboardList, accent: "warning", verb: "工作支援單" },
};

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const meta = META[item.type];
        const Icon = meta.icon;
        return (
          <li key={`${item.type}-${item.id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50">
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", ACCENTS[meta.accent].icon)}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">
                <span className="text-muted-foreground">{meta.verb}</span> · {item.title}
              </p>
            </div>
            <time className="shrink-0 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: zhTW })}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
