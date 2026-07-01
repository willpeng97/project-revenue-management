"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export interface PanelEmpty {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Panel({
  title,
  subtitle,
  action,
  loading = false,
  empty = false,
  emptyState,
  height = 300,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyState?: PanelEmpty;
  height?: number;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border border-border/70 bg-card shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <header className="flex items-center justify-between gap-3 px-5 pt-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className={cn("flex-1 p-5", bodyClassName)}>
        {loading ? (
          <div style={{ height }}>
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        ) : empty && emptyState ? (
          <EmptyState {...emptyState} className="h-full" />
        ) : (
          children
        )}
      </div>
    </section>
  );
}
