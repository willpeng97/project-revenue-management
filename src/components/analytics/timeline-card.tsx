"use client";

import { GitBranch, FileCheck2, ArrowLeftRight, ClipboardCheck, FolderCheck, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENTS, type AccentKey } from "@/lib/chart-theme";

export interface TimelineItem {
  id: string;
  type: "pipeline" | "quotation" | "transfer" | "workorder" | "project";
  title: string;
  timeLabel: string;
}

const META: Record<TimelineItem["type"], { icon: LucideIcon; accent: AccentKey }> = {
  pipeline: { icon: GitBranch, accent: "pipeline" },
  quotation: { icon: FileCheck2, accent: "primary" },
  transfer: { icon: ArrowLeftRight, accent: "transfer" },
  workorder: { icon: ClipboardCheck, accent: "warning" },
  project: { icon: FolderCheck, accent: "success" },
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-4 pl-2">
      {items.map((item, i) => {
        const meta = META[item.type];
        const Icon = meta.icon;
        const isLast = i === items.length - 1;
        return (
          <li key={item.id} className="relative flex gap-3">
            {!isLast && <span className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-px bg-border" />}
            <span className={cn("z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", ACCENTS[meta.accent].icon)}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="truncate text-sm text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.timeLabel}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
