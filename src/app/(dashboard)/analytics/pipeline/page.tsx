"use client";

import { useMemo } from "react";
import { GitBranch, Target, DollarSign, TrendingUp, Users2, Building2, Factory } from "lucide-react";
import { useAnalyticsFilters } from "@/lib/analytics/filter-context";
import { useSimulatedLoading } from "@/lib/analytics/use-simulated-loading";
import {
  pipelineFunnel,
  pipelineStats,
  pipelineBy,
  pipelineForecast,
  formatMoneyCompact,
  formatPercent,
} from "@/lib/analytics/selectors";
import { CHART_COLORS } from "@/lib/chart-theme";
import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { AnalyticsKpiCard } from "@/components/analytics/kpi-card";
import { Panel } from "@/components/analytics/panel";
import { TrendChart } from "@/components/analytics/charts/trend-chart";
import { BarList } from "@/components/analytics/charts/bar-list";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";

const STAGE_COLORS = [CHART_COLORS.purple, CHART_COLORS.blue, CHART_COLORS.emerald, CHART_COLORS.amber, CHART_COLORS.green];

export default function PipelineAnalyticsPage() {
  const { filters } = useAnalyticsFilters();
  const loading = useSimulatedLoading();

  const stats = useMemo(() => pipelineStats(filters), [filters]);
  const funnel = useMemo(
    () => pipelineFunnel(filters).map((s, i) => ({ label: s.label, count: s.count, amount: s.amount, color: STAGE_COLORS[i] })),
    [filters]
  );
  const forecast = useMemo(() => pipelineForecast(filters), [filters]);
  const bySales = useMemo(() => pipelineBy(filters, "salesId").map((r) => ({ label: r.label, value: r.amount })), [filters]);
  const byCustomer = useMemo(() => pipelineBy(filters, "customerId").slice(0, 8).map((r) => ({ label: r.label, value: r.amount })), [filters]);
  const byIndustry = useMemo(() => pipelineBy(filters, "industry").map((r) => ({ label: r.label, value: r.amount })), [filters]);

  const empty = stats.total === 0;

  return (
    <AnalyticsPage title="Pipeline Analytics" subtitle="商機分析 · 漏斗、轉換率與預測">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsKpiCard loading={loading} label="商機總數" value={String(stats.total)} sub={`成交 ${stats.won} · 失單 ${stats.lost}`} icon={GitBranch} accent="pipeline" />
        <AnalyticsKpiCard loading={loading} label="轉換率" value={formatPercent(stats.conversionRate)} sub="成交 ÷ (成交+失單)" icon={Target} accent="success" />
        <AnalyticsKpiCard loading={loading} label="平均案值" value={formatMoneyCompact(stats.avgDealSize)} sub="Average Deal Size" icon={DollarSign} accent="revenue" />
        <AnalyticsKpiCard loading={loading} label="加權預測" value={formatMoneyCompact(stats.weightedForecast)} sub={`未結案商機 ${formatMoneyCompact(stats.openValue)}`} icon={TrendingUp} accent="profit" />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-2" title="商機漏斗" subtitle="Potential → Won" loading={loading} empty={empty} emptyState={{ icon: GitBranch, title: "尚無商機", description: "建立第一個商機。" }}>
          <PipelineFunnel stages={funnel} />
        </Panel>
        <Panel className="lg:col-span-3" title="商機預測" subtitle="加權預期成交金額（依機率）" loading={loading} empty={empty} emptyState={{ icon: TrendingUp, title: "尚無預測資料" }}>
          <TrendChart data={forecast.map((f) => ({ label: f.label, value: f.value }))} series={[{ key: "value", name: "加權預測", color: CHART_COLORS.purple }]} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="商機 by 業務" subtitle="Pipeline by Sales" loading={loading} empty={bySales.length === 0} emptyState={{ icon: Users2, title: "尚無資料" }}>
          <BarList items={bySales} color={CHART_COLORS.blue} />
        </Panel>
        <Panel title="商機 by 客戶" subtitle="Pipeline by Customer" loading={loading} empty={byCustomer.length === 0} emptyState={{ icon: Building2, title: "尚無資料" }}>
          <BarList items={byCustomer} color={CHART_COLORS.emerald} />
        </Panel>
        <Panel title="商機 by 產業" subtitle="Pipeline by Industry" loading={loading} empty={byIndustry.length === 0} emptyState={{ icon: Factory, title: "尚無資料" }}>
          <BarList items={byIndustry} color={CHART_COLORS.amber} />
        </Panel>
      </div>
    </AnalyticsPage>
  );
}
