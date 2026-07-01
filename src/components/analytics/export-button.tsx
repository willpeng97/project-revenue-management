"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileText, Sheet, FileSpreadsheet, Printer } from "lucide-react";

const OPTIONS = [
  { key: "pdf", label: "匯出 PDF", icon: FileText },
  { key: "excel", label: "匯出 Excel", icon: Sheet },
  { key: "csv", label: "匯出 CSV", icon: FileSpreadsheet },
  { key: "print", label: "列印", icon: Printer },
];

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-slate-50"
      >
        <Download className="h-4 w-4" />
        匯出
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg"
        >
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-slate-50"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
