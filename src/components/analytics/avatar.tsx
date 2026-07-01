import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

export function Avatar({ name, className }: { name: string; className?: string }) {
  const idx = name.charCodeAt(0) % PALETTE.length;
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
        PALETTE[idx],
        className
      )}
    >
      {name.charAt(0)}
    </span>
  );
}
