"use client";

import { useMemo } from "react";
import { Wallet, TrendingDown, Coins, Percent, Users2, FolderKanban, ListChecks, GitBranch, Trophy, Activity } from "lucide-react";
import { useAnalyticsFilters } from "@/lib/analytics/filter-context";
import { useSimulatedLoading } from "@/lib/analytics/use-simulated-loading";
import {
  revenueKpis,
  revenueSeries,
  pipelineFunnel,
  projectHealth,
  taskDistribution,
  salesLeaderboard,
  projectRows,
  formatMoneyCompact,
  formatPercent,
} from "@/lib/analytics/selectors";
import { ACTIVITIES } from "@/lib/analytics/mock-data";
import { CHART_COLORS } from "@/lib/chart-theme";
import { formatCurrency } from "@/lib/utils";
import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { AnalyticsKpiCard } from "@/components/analytics/kpi-card";
import { Panel } from "@/components/analytics/panel";
import { TrendChart } from "@/components/analytics/charts/trend-chart";
import { DataTable } from "@/components/analytics/data-table";
import { Avatar } from "@/components/analytics/avatar";
import { Timeline } from "@/components/analytics/timeline-card";
import { StatusBadge } from "@/components/analytics/status-badge";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";

const STAGE_COLORS = [CHART_COLORS.purple, CHART_COLORS.blue, CHART_COLORS.emerald, CHART_COLORS.amber, CHART_COLORS.green];

export default function AnalyticsOverviewPage() {
  const { filters } = useAnalyticsFilters();
  const loading = useSimulatedLoading();

  const kpis = useMemo(() => revenueKpis(filters), [filters]);
  const trend = useMemo(
    () => revenueSeries(filters).map((m) => ({ label: m.label, revenue: m.revenue, cost: m.cost })),
    [filters]
  );
  const funnel = useMemo(
    () => pipelineFunnel(filters).map((s, i) => ({ label: s.label, count: s.count, amount: s.amount, color: STAGE_COLORS[i] })),
    [filters]
  );
  const health = useMemo(() => projectHealth(filters), [filters]);
  const tasks = useMemo(() => taskDistribution(), []);
  const sales = useMemo(() => salesLeaderboard(filters).slice(0, 5), [filters]);
  const topProjects = useMemo(
    () => [...projectRows(filters)].sort((a, b) => b.profit - a.profit).slice(0, 5),
    [filters]
  );

  return (
    <AnalyticsPage title="Analytics" subtitle="Business Intelligence Center · 企業主管決策中心">
      {/* Row 1 — Hero KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsKpiCard loading={loading} label="總營收" value={formatMoneyCompact(kpis.revenue)} sub="期間累計營收" icon={Wallet} accent="revenue" deltaPct={kpis.trend.revenue} spark={kpis.spark} />
        <AnalyticsKpiCard loading={loading} label="總成本" value={formatMoneyCompact(kpis.cost)} sub="期間累計成本" icon={TrendingDown} accent="cost" deltaPct={kpis.trend.cost} spark={kpis.costSpark} />
        <AnalyticsKpiCard loading={loading} label="總毛利" value={formatMoneyCompact(kpis.profit)} sub="營收 − 成本" icon={Coins} accent="profit" deltaPct={kpis.trend.profit} spark={kpis.profitSpark} />
        <AnalyticsKpiCard loading={loading} label="毛利率" value={formatPercent(kpis.margin, 1)} sub="毛利 ÷ 營收" icon={Percent} accent="pipeline" deltaPct={kpis.trend.margin} spark={kpis.marginSpark} />
      </div>

      {/* Row 2 — Revenue trend + Pipeline funnel */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Panel
          className="lg:col-span-3"
          title="營收趨勢"
          subtitle="營收 vs 成本"
          loading={loading}
          empty={trend.length === 0}
          emptyState={{ icon: Wallet, title: "尚無營收資料", description: "建立第一個專案以檢視營收趨勢。" }}
        >
          <TrendChart
            data={trend}
            series={[
              { key: "revenue", name: "營收", color: CHART_COLORS.emerald },
              { key: "cost", name: "成本", color: CHART_COLORS.orange },
            ]}
          />
        </Panel>
        <Panel
          className="lg:col-span-2"
          title="商機漏斗"
          subtitle="潛在 → 議約 → 成交"
          loading={loading}
          empty={funnel.every((s) => s.count === 0)}
          emptyState={{ icon: GitBranch, title: "尚無商機", description: "建立第一個商機。" }}
        >
          <PipelineFunnel stages={funnel} />
        </Panel>
      </div>

      {/* Row 3 — Project health + Task distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="專案健康度"
          subtitle="Normal / Risk / Delayed / Closed"
          loading={loading}
          empty={health.normal + health.risk + health.delayed + health.closed === 0}
          emptyState={{ icon: FolderKanban, title: "尚無專案", description: "建立第一個專案。" }}
        >
          <DonutChart
            centerValue={String(health.normal + health.risk + health.delayed + health.closed)}
            centerLabel="專案"
            data={[
              { name: "正常", value: health.normal, color: CHART_COLORS.emerald },
              { name: "風險", value: health.risk, color: CHART_COLORS.amber },
              { name: "延遲", value: health.delayed, color: CHART_COLORS.red },
              { name: "已結案", value: health.closed, color: CHART_COLORS.slate },
            ]}
          />
        </Panel>
        <Panel title="任務分佈" subtitle="Todo / Doing / Review / Done" loading={loading}>
          <DonutChart
            centerValue={String(tasks.reduce((s, t) => s + t.value, 0))}
            centerLabel="任務"
            data={[
              { name: tasks[0].label, value: tasks[0].value, color: CHART_COLORS.slate },
              { name: tasks[1].label, value: tasks[1].value, color: CHART_COLORS.blue },
              { name: tasks[2].label, value: tasks[2].value, color: CHART_COLORS.amber },
              { name: tasks[3].label, value: tasks[3].value, color: CHART_COLORS.emerald },
            ]}
          />
        </Panel>
      </div>

      {/* Row 4 — Top sales + Top projects */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="業務排行榜"
          subtitle="Top 5 by Revenue"
          action={<Trophy className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
          empty={sales.every((s) => s.revenue === 0)}
          emptyState={{ icon: Users2, title: "尚無業務資料", description: "尚無成交專案。" }}
        >
          <DataTable
            rows={sales}
            columns={[
              { key: "name", header: "業務", render: (r) => (
                <span className="flex items-center gap-2"><Avatar name={r.name} /><span className="font-medium">{r.name}</span></span>
              ) },
              { key: "revenue", header: "營收", align: "right", render: (r) => <span className="font-semibold">{formatMoneyCompact(r.revenue)}</span> },
              { key: "wonProjects", header: "成交", align: "right", render: (r) => r.wonProjects },
              { key: "winRate", header: "勝率", align: "right", render: (r) => formatPercent(r.winRate) },
            ]}
          />
        </Panel>
        <Panel
          title="最賺錢專案"
          subtitle="Top 5 by Profit"
          action={<FolderKanban className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
          empty={topProjects.length === 0}
          emptyState={{ icon: FolderKanban, title: "尚無專案", description: "建立第一個專案。" }}
        >
          <DataTable
            rows={topProjects}
            columns={[
              { key: "name", header: "專案", render: (r) => <span className="font-medium">{r.name}</span> },
              { key: "revenue", header: "營收", align: "right", render: (r) => formatMoneyCompact(r.revenue) },
              { key: "profit", header: "毛利", align: "right", render: (r) => <span className="font-semibold text-emerald-600">{formatMoneyCompact(r.profit)}</span> },
              { key: "margin", header: "毛利率", align: "right", render: (r) => formatPercent(r.margin) },
              { key: "status", header: "狀態", align: "center", render: (r) => <StatusBadge status={r.status} /> },
            ]}
          />
        </Panel>
      </div>

      {/* Row 5 — Recent activity */}
      <Panel title="近期動態" subtitle="Recent Activity" action={<Activity className="h-4 w-4 text-muted-foreground" />} loading={loading}>
        <Timeline
          items={ACTIVITIES.slice(0, 6).map((a) => ({
            id: a.id,
            type: a.type,
            title: a.title,
            timeLabel: a.dayOffset === 0 ? "今天" : `${a.dayOffset} 天前`,
          }))}
        />
      </Panel>

      <p className="pt-1 text-center text-xs text-muted-foreground">
        <ListChecks className="mr-1 inline h-3 w-3" />
        以上數據為 Analytics 模組展示用資料
      </p>
    </AnalyticsPage>
  );
}
