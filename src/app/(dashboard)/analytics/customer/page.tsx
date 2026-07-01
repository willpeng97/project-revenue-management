"use client";

import { useMemo } from "react";
import { Building2, Crown, Wallet, Gem, Factory, Repeat } from "lucide-react";
import { useAnalyticsFilters } from "@/lib/analytics/filter-context";
import { useSimulatedLoading } from "@/lib/analytics/use-simulated-loading";
import { customerRows, industryDistribution, formatMoneyCompact } from "@/lib/analytics/selectors";
import { CHART_COLORS } from "@/lib/chart-theme";
import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { AnalyticsKpiCard } from "@/components/analytics/kpi-card";
import { Panel } from "@/components/analytics/panel";
import { DataTable } from "@/components/analytics/data-table";
import { BarList } from "@/components/analytics/charts/bar-list";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { Avatar } from "@/components/analytics/avatar";

const PALETTE = [
  CHART_COLORS.blue, CHART_COLORS.emerald, CHART_COLORS.amber, CHART_COLORS.purple,
  CHART_COLORS.red, CHART_COLORS.green, CHART_COLORS.orange, CHART_COLORS.slate,
];

export default function CustomerAnalyticsPage() {
  const { filters } = useAnalyticsFilters();
  const loading = useSimulatedLoading();

  const rows = useMemo(() => customerRows(filters), [filters]);
  const industries = useMemo(() => industryDistribution(filters), [filters]);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const avgLtv = rows.length > 0 ? rows.reduce((s, r) => s + r.ltv, 0) / rows.length : 0;
  const top = rows[0];

  const ltvRanking = [...rows].sort((a, b) => b.ltv - a.ltv).slice(0, 8).map((c) => ({ label: c.name, value: c.ltv }));
  const recurring = rows.filter((c) => c.recurring > 0).sort((a, b) => b.recurring - a.recurring).map((c) => ({ label: c.name, value: c.recurring }));
  const contribution = rows.slice(0, 8).map((c) => ({ label: c.name, value: c.revenue }));

  const empty = rows.length === 0;
  const noData = { icon: Building2, title: "尚無客戶資料", description: "尚無客戶相關專案。" };

  return (
    <AnalyticsPage title="Customer Analytics" subtitle="客戶分析 · 價值貢獻與產業分佈">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsKpiCard loading={loading} label="活躍客戶" value={String(rows.length)} sub="有專案往來" icon={Building2} accent="primary" />
        <AnalyticsKpiCard loading={loading} label="最大客戶" value={top?.name ?? "—"} sub={top ? formatMoneyCompact(top.revenue) : ""} icon={Crown} accent="warning" />
        <AnalyticsKpiCard loading={loading} label="營收貢獻" value={formatMoneyCompact(totalRevenue)} sub="全部客戶" icon={Wallet} accent="revenue" />
        <AnalyticsKpiCard loading={loading} label="平均 LTV" value={formatMoneyCompact(avgLtv)} sub="Customer Lifetime Value" icon={Gem} accent="pipeline" />
      </div>

      <Panel title="頂尖客戶" subtitle="Top Customers" loading={loading} empty={empty} emptyState={noData}>
        <DataTable
          rows={rows.slice(0, 8)}
          columns={[
            { key: "name", header: "客戶", render: (r) => (<span className="flex items-center gap-2"><Avatar name={r.name} /><span className="font-medium">{r.name}</span></span>) },
            { key: "industry", header: "產業", render: (r) => r.industry },
            { key: "projects", header: "專案數", align: "right", render: (r) => r.projects },
            { key: "revenue", header: "營收", align: "right", render: (r) => <span className="font-semibold">{formatMoneyCompact(r.revenue)}</span> },
            { key: "profit", header: "毛利", align: "right", render: (r) => <span className="text-emerald-600">{formatMoneyCompact(r.profit)}</span> },
            { key: "ltv", header: "LTV", align: "right", render: (r) => formatMoneyCompact(r.ltv) },
          ]}
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="營收貢獻" subtitle="Revenue Contribution" loading={loading} empty={contribution.length === 0} emptyState={noData}>
          <BarList items={contribution} color={CHART_COLORS.emerald} />
        </Panel>
        <Panel title="產業分佈" subtitle="Industry Distribution" loading={loading} empty={industries.length === 0} emptyState={{ icon: Factory, title: "尚無資料" }}>
          <DonutChart
            centerValue={formatMoneyCompact(totalRevenue)}
            centerLabel="營收"
            data={industries.map((d, i) => ({ name: d.label, value: d.value, color: PALETTE[i % PALETTE.length] }))}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="客戶終身價值" subtitle="Customer LTV Ranking" loading={loading} empty={ltvRanking.length === 0} emptyState={noData}>
          <BarList items={ltvRanking} color={CHART_COLORS.purple} />
        </Panel>
        <Panel title="經常性收入" subtitle="Recurring Revenue（維護型專案）" loading={loading} empty={recurring.length === 0} emptyState={{ icon: Repeat, title: "尚無經常性收入", description: "尚無維護型專案。" }}>
          <BarList items={recurring} color={CHART_COLORS.blue} />
        </Panel>
      </div>
    </AnalyticsPage>
  );
}
