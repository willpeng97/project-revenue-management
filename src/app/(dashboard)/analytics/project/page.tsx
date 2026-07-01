"use client";

import { useMemo } from "react";
import { FolderKanban, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { useAnalyticsFilters } from "@/lib/analytics/filter-context";
import { useSimulatedLoading } from "@/lib/analytics/use-simulated-loading";
import {
  projectHealth,
  projectStatusBreakdown,
  projectRows,
  projectCompletionRate,
  formatMoneyCompact,
  formatPercent,
} from "@/lib/analytics/selectors";
import { CHART_COLORS } from "@/lib/chart-theme";
import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { AnalyticsKpiCard } from "@/components/analytics/kpi-card";
import { Panel } from "@/components/analytics/panel";
import { DataTable } from "@/components/analytics/data-table";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { StatusBadge, HealthBadge } from "@/components/analytics/status-badge";

export default function ProjectAnalyticsPage() {
  const { filters } = useAnalyticsFilters();
  const loading = useSimulatedLoading();

  const rows = useMemo(() => projectRows(filters), [filters]);
  const health = useMemo(() => projectHealth(filters), [filters]);
  const statusBreakdown = useMemo(() => projectStatusBreakdown(filters), [filters]);
  const completion = useMemo(() => projectCompletionRate(filters), [filters]);

  const marginRanking = [...rows].sort((a, b) => b.margin - a.margin).slice(0, 6);
  const delayRanking = rows.filter((r) => r.delayDays > 0).sort((a, b) => b.delayDays - a.delayDays).slice(0, 6);
  const overBudget = rows.filter((r) => r.overBudget).slice(0, 6);
  const completionList = [...rows].sort((a, b) => b.progress - a.progress).slice(0, 6);

  const overBudgetCount = rows.filter((r) => r.overBudget).length;
  const delayedCount = rows.filter((r) => r.delayDays > 0).length;
  const empty = rows.length === 0;
  const noProjects = { icon: FolderKanban, title: "尚無專案", description: "建立第一個專案。" };

  return (
    <AnalyticsPage title="Project Analytics" subtitle="專案分析 · 健康度、毛利與風險">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsKpiCard loading={loading} label="專案總數" value={String(rows.length)} sub="符合篩選條件" icon={FolderKanban} accent="primary" />
        <AnalyticsKpiCard loading={loading} label="完成率" value={formatPercent(completion)} sub="已結案 ÷ 全部" icon={CheckCircle2} accent="success" />
        <AnalyticsKpiCard loading={loading} label="超支專案" value={String(overBudgetCount)} sub="Over Budget" icon={AlertTriangle} accent="danger" />
        <AnalyticsKpiCard loading={loading} label="延遲專案" value={String(delayedCount)} sub="Delayed" icon={Clock} accent="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="專案健康度" subtitle="Normal / Risk / Delayed / Closed" loading={loading} empty={empty} emptyState={noProjects}>
          <DonutChart
            centerValue={String(rows.length)}
            centerLabel="專案"
            data={[
              { name: "正常", value: health.normal, color: CHART_COLORS.emerald },
              { name: "風險", value: health.risk, color: CHART_COLORS.amber },
              { name: "延遲", value: health.delayed, color: CHART_COLORS.red },
              { name: "已結案", value: health.closed, color: CHART_COLORS.slate },
            ]}
          />
        </Panel>
        <Panel title="專案狀態分佈" subtitle="Project Status" loading={loading} empty={empty} emptyState={noProjects}>
          <DonutChart
            centerValue={String(rows.length)}
            centerLabel="專案"
            data={statusBreakdown.map((s, i) => ({
              name: s.label,
              value: s.value,
              color: [CHART_COLORS.slate, CHART_COLORS.blue, CHART_COLORS.amber, CHART_COLORS.emerald][i],
            }))}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="毛利率排行" subtitle="Margin Ranking" loading={loading} empty={empty} emptyState={noProjects}>
          <DataTable
            rows={marginRanking}
            columns={[
              { key: "name", header: "專案", render: (r) => <span className="font-medium">{r.name}</span> },
              { key: "revenue", header: "營收", align: "right", render: (r) => formatMoneyCompact(r.revenue) },
              { key: "profit", header: "毛利", align: "right", render: (r) => <span className="font-semibold text-emerald-600">{formatMoneyCompact(r.profit)}</span> },
              { key: "margin", header: "毛利率", align: "right", render: (r) => formatPercent(r.margin) },
            ]}
          />
        </Panel>
        <Panel title="延遲排行" subtitle="Delay Ranking" loading={loading} empty={delayRanking.length === 0} emptyState={{ icon: Clock, title: "無延遲專案", description: "所有專案皆在期程內。" }}>
          <DataTable
            rows={delayRanking}
            columns={[
              { key: "name", header: "專案", render: (r) => <span className="font-medium">{r.name}</span> },
              { key: "sales", header: "業務", render: (r) => r.sales },
              { key: "health", header: "健康度", align: "center", render: (r) => <HealthBadge health={r.health} /> },
              { key: "delayDays", header: "延遲天數", align: "right", render: (r) => <span className="font-semibold text-red-600">{r.delayDays} 天</span> },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="超支專案" subtitle="Over Budget Projects" loading={loading} empty={overBudget.length === 0} emptyState={{ icon: AlertTriangle, title: "無超支專案", description: "所有專案皆在預算內。" }}>
          <DataTable
            rows={overBudget}
            columns={[
              { key: "name", header: "專案", render: (r) => <span className="font-medium">{r.name}</span> },
              { key: "revenue", header: "營收", align: "right", render: (r) => formatMoneyCompact(r.revenue) },
              { key: "cost", header: "成本", align: "right", render: (r) => <span className="text-orange-600">{formatMoneyCompact(r.cost)}</span> },
              { key: "status", header: "狀態", align: "center", render: (r) => <StatusBadge status={r.status} /> },
            ]}
          />
        </Panel>
        <Panel title="專案進度總覽" subtitle="Timeline Overview" loading={loading} empty={empty} emptyState={noProjects}>
          <ul className="space-y-3">
            {completionList.map((p) => (
              <li key={p.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate font-medium text-foreground">{p.name}</span>
                  <span className="text-muted-foreground">{p.progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500" style={{ width: `${Math.max(p.progress, 3)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AnalyticsPage>
  );
}
