"use client";

import { useMemo } from "react";
import { Wallet, TrendingDown, Coins, Percent, Building2, Users2, FolderKanban } from "lucide-react";
import { useAnalyticsFilters } from "@/lib/analytics/filter-context";
import { useSimulatedLoading } from "@/lib/analytics/use-simulated-loading";
import {
  revenueKpis,
  revenueSeries,
  revenueByCustomer,
  revenueBySales,
  revenueByProject,
  projectRows,
  formatMoneyCompact,
  formatPercent,
} from "@/lib/analytics/selectors";
import { CHART_COLORS } from "@/lib/chart-theme";
import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { AnalyticsKpiCard } from "@/components/analytics/kpi-card";
import { Panel } from "@/components/analytics/panel";
import { TrendChart } from "@/components/analytics/charts/trend-chart";
import { BarList } from "@/components/analytics/charts/bar-list";
import { DataTable } from "@/components/analytics/data-table";

export default function RevenueAnalyticsPage() {
  const { filters } = useAnalyticsFilters();
  const loading = useSimulatedLoading();

  const kpis = useMemo(() => revenueKpis(filters), [filters]);
  const trend = useMemo(
    () => revenueSeries(filters).map((m) => ({ label: m.label, revenue: m.revenue, cost: m.cost })),
    [filters]
  );
  const marginTrend = useMemo(
    () => revenueSeries(filters).map((m) => ({ label: m.label, margin: m.revenue > 0 ? (m.profit / m.revenue) * 100 : 0 })),
    [filters]
  );
  const byCustomer = useMemo(() => revenueByCustomer(filters), [filters]);
  const bySales = useMemo(() => revenueBySales(filters), [filters]);
  const byProject = useMemo(() => revenueByProject(filters), [filters]);
  const sortedProjects = useMemo(() => [...projectRows(filters)].sort((a, b) => b.revenue - a.revenue), [filters]);
  const top = sortedProjects.slice(0, 5);
  const bottom = sortedProjects.slice(-5).reverse();

  const emptyRevenue = kpis.revenue === 0;

  return (
    <AnalyticsPage title="Revenue Analytics" subtitle="營收分析 · 收入、成本與毛利洞察">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsKpiCard loading={loading} label="總營收" value={formatMoneyCompact(kpis.revenue)} sub="期間累計" icon={Wallet} accent="revenue" deltaPct={kpis.trend.revenue} spark={kpis.spark} />
        <AnalyticsKpiCard loading={loading} label="總成本" value={formatMoneyCompact(kpis.cost)} sub="期間累計" icon={TrendingDown} accent="cost" deltaPct={kpis.trend.cost} spark={kpis.costSpark} />
        <AnalyticsKpiCard loading={loading} label="總毛利" value={formatMoneyCompact(kpis.profit)} sub="營收 − 成本" icon={Coins} accent="profit" deltaPct={kpis.trend.profit} spark={kpis.profitSpark} />
        <AnalyticsKpiCard loading={loading} label="毛利率" value={formatPercent(kpis.margin, 1)} sub="毛利 ÷ 營收" icon={Percent} accent="pipeline" deltaPct={kpis.trend.margin} spark={kpis.marginSpark} />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3" title="營收 vs 成本" subtitle="月度趨勢" loading={loading} empty={emptyRevenue} emptyState={{ icon: Wallet, title: "尚無營收資料", description: "建立第一個專案。" }}>
          <TrendChart data={trend} series={[{ key: "revenue", name: "營收", color: CHART_COLORS.emerald }, { key: "cost", name: "成本", color: CHART_COLORS.orange }]} />
        </Panel>
        <Panel className="lg:col-span-2" title="毛利率趨勢" subtitle="Profit Margin %" loading={loading} empty={emptyRevenue} emptyState={{ icon: Percent, title: "尚無資料" }}>
          <TrendChart data={marginTrend} variant="line" series={[{ key: "margin", name: "毛利率", color: CHART_COLORS.blue }]} valueFormatter={(v) => formatPercent(v, 1)} axisFormatter={(v) => `${Math.round(v)}%`} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="營收 by 客戶" subtitle="Top Customers" loading={loading} empty={byCustomer.length === 0} emptyState={{ icon: Building2, title: "尚無資料" }}>
          <BarList items={byCustomer} color={CHART_COLORS.emerald} />
        </Panel>
        <Panel title="營收 by 業務" subtitle="By Sales" loading={loading} empty={bySales.length === 0} emptyState={{ icon: Users2, title: "尚無資料" }}>
          <BarList items={bySales} color={CHART_COLORS.blue} />
        </Panel>
        <Panel title="營收 by 專案" subtitle="Top Projects" loading={loading} empty={byProject.length === 0} emptyState={{ icon: FolderKanban, title: "尚無資料" }}>
          <BarList items={byProject} color={CHART_COLORS.purple} />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="營收最高專案" subtitle="Top Revenue Projects" loading={loading} empty={top.length === 0} emptyState={{ icon: FolderKanban, title: "尚無專案" }}>
          <DataTable
            rows={top}
            columns={[
              { key: "name", header: "專案", render: (r) => <span className="font-medium">{r.name}</span> },
              { key: "customer", header: "客戶", render: (r) => r.customer },
              { key: "revenue", header: "營收", align: "right", render: (r) => <span className="font-semibold">{formatMoneyCompact(r.revenue)}</span> },
              { key: "margin", header: "毛利率", align: "right", render: (r) => formatPercent(r.margin) },
            ]}
          />
        </Panel>
        <Panel title="營收最低專案" subtitle="Bottom Revenue Projects" loading={loading} empty={bottom.length === 0} emptyState={{ icon: FolderKanban, title: "尚無專案" }}>
          <DataTable
            rows={bottom}
            columns={[
              { key: "name", header: "專案", render: (r) => <span className="font-medium">{r.name}</span> },
              { key: "customer", header: "客戶", render: (r) => r.customer },
              { key: "revenue", header: "營收", align: "right", render: (r) => <span className="font-semibold">{formatMoneyCompact(r.revenue)}</span> },
              { key: "margin", header: "毛利率", align: "right", render: (r) => formatPercent(r.margin) },
            ]}
          />
        </Panel>
      </div>
    </AnalyticsPage>
  );
}
