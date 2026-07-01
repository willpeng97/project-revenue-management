import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-md bg-slate-200/70", className)}
      style={{ animation: "skeleton-pulse 1.6s ease-in-out infinite" }}
    />
  );
}
