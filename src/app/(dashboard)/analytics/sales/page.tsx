"use client";

import { useMemo } from "react";
import { Wallet, Target, Trophy, Briefcase, Users2 } from "lucide-react";
import { useAnalyticsFilters } from "@/lib/analytics/filter-context";
import { useSimulatedLoading } from "@/lib/analytics/use-simulated-loading";
import { salesLeaderboard, formatMoneyCompact, formatPercent } from "@/lib/analytics/selectors";
import { CHART_COLORS } from "@/lib/chart-theme";
import { AnalyticsPage } from "@/components/analytics/analytics-page";
import { AnalyticsKpiCard } from "@/components/analytics/kpi-card";
import { Panel } from "@/components/analytics/panel";
import { DataTable } from "@/components/analytics/data-table";
import { BarList } from "@/components/analytics/charts/bar-list";
import { Avatar } from "@/components/analytics/avatar";
import { ProgressCard } from "@/components/analytics/progress-card";

export default function SalesAnalyticsPage() {
  const { filters } = useAnalyticsFilters();
  const loading = useSimulatedLoading();

  const board = useMemo(() => salesLeaderboard(filters), [filters]);
  const totalRevenue = board.reduce((s, r) => s + r.revenue, 0);
  const avgWinRate = board.length > 0 ? board.reduce((s, r) => s + r.winRate, 0) / board.length : 0;
  const totalPipeline = board.reduce((s, r) => s + r.pipelineValue, 0);
  const top = board[0];
  const empty = board.every((r) => r.revenue === 0);
  const noData = { icon: Users2, title: "尚無業務資料", description: "尚無成交專案。" };

  return (
    <AnalyticsPage title="Sales Analytics" subtitle="業務分析 · 排行榜與績效達成">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnalyticsKpiCard loading={loading} label="業務總營收" value={formatMoneyCompact(totalRevenue)} sub="全體業務" icon={Wallet} accent="revenue" />
        <AnalyticsKpiCard loading={loading} label="平均勝率" value={formatPercent(avgWinRate)} sub="Average Win Rate" icon={Target} accent="success" />
        <AnalyticsKpiCard loading={loading} label="Pipeline 總值" value={formatMoneyCompact(totalPipeline)} sub="未結案商機" icon={Briefcase} accent="pipeline" />
        <AnalyticsKpiCard loading={loading} label="業績冠軍" value={top?.name ?? "—"} sub={top ? formatMoneyCompact(top.revenue) : ""} icon={Trophy} accent="warning" />
      </div>

      <Panel title="業務排行榜" subtitle="Sales Leaderboard" loading={loading} empty={empty} emptyState={noData}>
        <DataTable
          rows={board}
          columns={[
            { key: "rank", header: "#", render: (_r, i) => <span className="text-muted-foreground">{i + 1}</span> },
            { key: "name", header: "業務", render: (r) => (<span className="flex items-center gap-2"><Avatar name={r.name} /><span className="font-medium">{r.name}</span></span>) },
            { key: "revenue", header: "營收", align: "right", render: (r) => <span className="font-semibold">{formatMoneyCompact(r.revenue)}</span> },
            { key: "wonProjects", header: "成交", align: "right", render: (r) => r.wonProjects },
            { key: "winRate", header: "勝率", align: "right", render: (r) => formatPercent(r.winRate) },
            { key: "avgDealSize", header: "平均案值", align: "right", render: (r) => formatMoneyCompact(r.avgDealSize) },
            { key: "pipelineValue", header: "Pipeline", align: "right", render: (r) => formatMoneyCompact(r.pipelineValue) },
          ]}
        />
      </Panel>

      <Panel title="業績達成率" subtitle="Achievement Progress · 目標 vs 實際" loading={loading} empty={empty} emptyState={noData}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {board.map((r) => (
            <ProgressCard key={r.id} name={r.name} valueLabel={formatMoneyCompact(r.revenue)} targetLabel={formatMoneyCompact(r.target)} percent={r.achievement} />
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="營收排行" subtitle="Revenue Ranking" loading={loading} empty={empty} emptyState={noData}>
          <BarList items={board.map((r) => ({ label: r.name, value: r.revenue }))} color={CHART_COLORS.emerald} />
        </Panel>
        <Panel title="勝率排行" subtitle="Win Rate Ranking" loading={loading} empty={empty} emptyState={noData}>
          <BarList
            items={[...board].sort((a, b) => b.winRate - a.winRate).map((r) => ({ label: r.name, value: r.winRate }))}
            color={CHART_COLORS.blue}
            max={100}
            valueFormatter={(v) => formatPercent(v)}
          />
        </Panel>
      </div>
    </AnalyticsPage>
  );
}
