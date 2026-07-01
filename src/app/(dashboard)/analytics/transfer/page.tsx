"use client";

import { useMemo } from "react";
import { ArrowLeftRight, Hash, Calculator, Repeat, Users2, Building, FolderKanban } from "lucide-react";
import { useAnalyticsFilters } from "@/lib/analytics/filter-context";
import { useSimulatedLoading } from "@/lib/analytics/use-simulated-loading";
import { transferTrend, transferByType, transferBy, transferStats, formatMoneyCompact } from "@/lib/analytics/selectors";
import { CHART_COLORS } from "@/lib/chart-theme";
import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { AnalyticsKpiCard } from "@/components/analytics/kpi-card";
import { Panel } from "@/components/analytics/panel";
import { TrendChart } from "@/components/analytics/charts/trend-chart";
import { BarList } from "@/components/analytics/charts/bar-list";
import { DonutChart } from "@/components/dashboard/donut-chart";

const TYPE_COLORS = [CHART_COLORS.blue, CHART_COLORS.amber, CHART_COLORS.emerald, CHART_COLORS.purple];

export default function TransferAnalyticsPage() {
  const { filters } = useAnalyticsFilters();
  const loading = useSimulatedLoading();

  const stats = useMemo(() => transferStats(filters), [filters]);
  const trend = useMemo(() => transferTrend(filters), [filters]);
  const byType = useMemo(() => transferByType(filters), [filters]);
  const bySales = useMemo(() => transferBy(filters, "salesId").map((r) => ({ label: r.label, value: r.amount })), [filters]);
  const byDept = useMemo(() => transferBy(filters, "department").map((r) => ({ label: r.label, value: r.amount })), [filters]);
  const byProject = useMemo(() => transferBy(filters, "projectId").slice(0, 8).map((r) => ({ label: r.label, value: r.amount })), [filters]);

  const empty = stats.count === 0;
  const noData = { icon: ArrowLeftRight, title: "尚無轉撥資料", description: "建立第一筆轉撥。" };

  return (
    <AnalyticsPage title="Transfer Analytics" subtitle="轉撥分析 · 本平台特色模組">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsKpiCard loading={loading} label="轉撥總額" value={formatMoneyCompact(stats.total)} sub="期間累計" icon={ArrowLeftRight} accent="transfer" />
        <AnalyticsKpiCard loading={loading} label="轉撥筆數" value={String(stats.count)} sub="Transfer Count" icon={Hash} accent="primary" />
        <AnalyticsKpiCard loading={loading} label="平均轉撥" value={formatMoneyCompact(stats.average)} sub="Average Transfer" icon={Calculator} accent="revenue" />
        <AnalyticsKpiCard loading={loading} label="轉撥頻率" value={`${stats.frequency.toFixed(1)} / 月`} sub="Transfer Frequency" icon={Repeat} accent="pipeline" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3" title="轉撥趨勢" subtitle="Transfer Trend" loading={loading} empty={empty} emptyState={noData}>
          <TrendChart data={trend.map((t) => ({ label: t.label, value: t.value }))} series={[{ key: "value", name: "轉撥金額", color: CHART_COLORS.amber }]} />
        </Panel>
        <Panel className="lg:col-span-2" title="轉撥類型" subtitle="一般 / 假日 / 追加 / 調整" loading={loading} empty={empty} emptyState={noData}>
          <DonutChart
            centerValue={formatMoneyCompact(stats.total)}
            centerLabel="總額"
            data={byType.map((t, i) => ({ name: t.label, value: t.value, color: TYPE_COLORS[i] }))}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="轉撥 by 業務" subtitle="Transfer by Sales" loading={loading} empty={bySales.length === 0} emptyState={{ icon: Users2, title: "尚無資料" }}>
          <BarList items={bySales} color={CHART_COLORS.blue} />
        </Panel>
        <Panel title="轉撥 by 部門" subtitle="Transfer by Department" loading={loading} empty={byDept.length === 0} emptyState={{ icon: Building, title: "尚無資料" }}>
          <BarList items={byDept} color={CHART_COLORS.emerald} />
        </Panel>
        <Panel title="轉撥最多專案" subtitle="Top Transfer Projects" loading={loading} empty={byProject.length === 0} emptyState={{ icon: FolderKanban, title: "尚無資料" }}>
          <BarList items={byProject} color={CHART_COLORS.purple} />
        </Panel>
      </div>
    </AnalyticsPage>
  );
}
