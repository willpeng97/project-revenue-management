"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useAnalyticsFilters } from "@/lib/analytics/filter-context";
import { SALES_REPS, CUSTOMERS, type ProjectStatus, type ProjectType } from "@/lib/analytics/mock-data";

const STATUS_OPTIONS: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "全部狀態" },
  { value: "PLANNING", label: "規劃中" },
  { value: "EXECUTING", label: "執行中" },
  { value: "ACCEPTANCE", label: "驗收中" },
  { value: "CLOSED", label: "已結案" },
];

const TYPE_OPTIONS: { value: ProjectType | "all"; label: string }[] = [
  { value: "all", label: "全部類型" },
  { value: "NEW_DEVELOPMENT", label: "新開發" },
  { value: "MAINTENANCE", label: "維護" },
  { value: "CONSULTING", label: "顧問" },
  { value: "OTHER", label: "其他" },
];

function Select({
  value,
  onChange,
  children,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm text-foreground transition-colors hover:bg-slate-50 focus:outline-none"
    >
      {children}
    </select>
  );
}

export function AnalyticsFilterBar() {
  const { filters, setFilter, reset } = useAnalyticsFilters();
  const dirty =
    filters.salesId !== "all" ||
    filters.customerId !== "all" ||
    filters.status !== "all" ||
    filters.projectType !== "all";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        篩選
      </span>
      <Select label="業務" value={filters.salesId} onChange={(v) => setFilter("salesId", v)}>
        <option value="all">全部業務</option>
        {SALES_REPS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
      <Select label="客戶" value={filters.customerId} onChange={(v) => setFilter("customerId", v)}>
        <option value="all">全部客戶</option>
        {CUSTOMERS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select label="狀態" value={filters.status} onChange={(v) => setFilter("status", v as ProjectStatus | "all")}>
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      <Select label="專案類型" value={filters.projectType} onChange={(v) => setFilter("projectType", v as ProjectType | "all")}>
        {TYPE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      {dirty && (
        <button
          onClick={reset}
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
          清除
        </button>
      )}
    </div>
  );
}
