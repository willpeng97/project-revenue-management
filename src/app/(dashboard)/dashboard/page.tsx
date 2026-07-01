"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import {
  GitBranch,
  TrendingUp,
  Wallet,
  FolderKanban,
  Plus,
  Activity,
  Trophy,
  ListChecks,
  Filter,
  HeartPulse,
  Rocket,
  CalendarClock,
  ClipboardCheck,
  CheckCircle2,
} from "lucide-react";
import { subMonths, startOfMonth, isSameMonth, format } from "date-fns";
import { api } from "@/lib/api-client";
import type {
  DashboardData,
  Pipeline,
  Project,
  Task,
  Transfer,
  Quotation,
  WorkOrder,
} from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/chart-theme";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart";
import { PipelineFunnel, type FunnelStage } from "@/components/dashboard/pipeline-funnel";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { RecentActivity, type ActivityItem } from "@/components/dashboard/recent-activity";
import { TopSales } from "@/components/dashboard/top-sales";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

const num = (v: string | number | null | undefined) =>
  v == null ? 0 : typeof v === "number" ? v : parseFloat(v || "0");

export default function DashboardPage() {
  const results = useQueries({
    queries: [
      { queryKey: ["dashboard"], queryFn: api.dashboard },
      { queryKey: ["pipelines"], queryFn: api.pipelines },
      { queryKey: ["projects"], queryFn: api.projects },
      { queryKey: ["tasks"], queryFn: () => api.tasks() },
      { queryKey: ["transfers"], queryFn: () => api.transfers() },
      { queryKey: ["quotations"], queryFn: api.quotations },
      { queryKey: ["work-orders"], queryFn: () => api.workOrders() },
    ],
  });

  const [dashboardQ, pipelinesQ, projectsQ, tasksQ, transfersQ, quotationsQ, workOrdersQ] = results;
  const isLoading = dashboardQ.isLoading;

  const data = dashboardQ.data as DashboardData | undefined;
  const pipelines = useMemo(() => (pipelinesQ.data as Pipeline[] | undefined) ?? [], [pipelinesQ.data]);
  const projects = useMemo(() => (projectsQ.data as Project[] | undefined) ?? [], [projectsQ.data]);
  const tasks = useMemo(() => (tasksQ.data as Task[] | undefined) ?? [], [tasksQ.data]);
  const transfers = useMemo(() => (transfersQ.data as Transfer[] | undefined) ?? [], [transfersQ.data]);
  const quotations = useMemo(() => (quotationsQ.data as Quotation[] | undefined) ?? [], [quotationsQ.data]);
  const workOrders = useMemo(() => (workOrdersQ.data as WorkOrder[] | undefined) ?? [], [workOrdersQ.data]);

  const revenueTrend = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, idx) => {
      const month = startOfMonth(subMonths(now, 5 - idx));
      const value = transfers
        .filter((t) => isSameMonth(new Date(t.date), month))
        .reduce((s, t) => s + num(t.amount), 0);
      return { label: format(month, "M月"), value };
    });
  }, [transfers]);

  const funnel = useMemo<FunnelStage[]>(() => {
    const byStatus = (statuses: string[]) =>
      pipelines.filter((p) => statuses.includes(p.status));
    const sumCost = (rows: Pipeline[]) => rows.reduce((s, p) => s + num(p.cost), 0);
    const potential = byStatus(["POTENTIAL", "CONTACTING"]);
    const quotation = byStatus(["QUOTATION"]);
    const won = byStatus(["WON"]);
    const closed = projects.filter((p) => p.status === "CLOSED");
    return [
      { label: "潛在商機", count: potential.length, amount: sumCost(potential), color: CHART_COLORS.purple },
      { label: "報價中", count: quotation.length, amount: sumCost(quotation), color: CHART_COLORS.blue },
      { label: "已成交", count: won.length, amount: sumCost(won), color: CHART_COLORS.emerald },
      {
        label: "已結案",
        count: closed.length,
        amount: closed.reduce((s, p) => s + num(p.income), 0),
        color: CHART_COLORS.slate,
      },
    ];
  }, [pipelines, projects]);

  const projectHealth = useMemo(() => {
    const now = new Date();
    const soon = new Date(now.getTime() + 14 * 86400000);
    let delayed = 0;
    let risk = 0;
    let normal = 0;
    for (const p of projects) {
      if (p.status === "CLOSED") continue;
      const end = p.endDate ? new Date(p.endDate) : null;
      if (end && end < now) delayed += 1;
      else if (end && end <= soon) risk += 1;
      else normal += 1;
    }
    return { delayed, risk, normal, active: delayed + risk + normal };
  }, [projects]);

  const taskStatus = useMemo(() => {
    const count = (status: string) => tasks.filter((t) => t.status === status).length;
    return {
      todo: count("TODO"),
      doing: count("DOING"),
      review: count("REVIEW"),
      done: count("DONE"),
      total: tasks.length,
    };
  }, [tasks]);

  const quickStats = useMemo(() => {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 86400000);
    return {
      executing: projects.filter((p) => p.status === "EXECUTING").length,
      upcoming: projects.filter(
        (p) => p.status !== "CLOSED" && p.endDate && new Date(p.endDate) > now && new Date(p.endDate) <= in30
      ).length,
      acceptance: projects.filter((p) => p.status === "ACCEPTANCE").length,
      completed: projects.filter((p) => p.status === "CLOSED").length,
    };
  }, [projects]);

  const activity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];
    pipelines.forEach((p) => p.createdAt && items.push({ id: p.id, type: "pipeline", title: p.title, date: p.createdAt }));
    quotations.forEach(
      (q) => q.createdAt && items.push({ id: q.id, type: "quotation", title: `${q.pipeline.title} v${q.version}`, date: q.createdAt })
    );
    transfers.forEach((t) =>
      items.push({
        id: t.id,
        type: "transfer",
        title: `${t.project?.quotation.pipeline.title ?? "專案"} · ${formatCurrency(t.amount)}`,
        date: t.date,
      })
    );
    workOrders.forEach((w) =>
      items.push({
        id: w.id,
        type: "workorder",
        title: w.project?.quotation.pipeline.title ?? w.customer.name,
        date: w.serviceDate,
      })
    );
    return items
      .filter((i) => i.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [pipelines, quotations, transfers, workOrders]);

  const topSales = useMemo(
    () => [...(data?.transfer.bySales ?? [])].sort((a, b) => b.amount - a.amount).slice(0, 5),
    [data]
  );

  if (isLoading || !data) return <DashboardSkeleton />;

  const margin = data.revenue.monthIncome > 0 ? Math.round((data.revenue.profit / data.revenue.monthIncome) * 100) : 0;
  const lastUpdated = format(new Date(), "yyyy/MM/dd HH:mm");

  return (
    <div className="space-y-6" style={{ animation: "var(--animate-fade-in-up)" }}>
      <PageHeader
        title="營收儀表板"
        breadcrumb={["M122", "Dashboard"]}
        meta={`最後更新 ${lastUpdated}`}
        actions={
          <Link
            href="/pipelines"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
          >
            <Plus className="h-4 w-4" />
            新增商機
          </Link>
        }
      />

      {/* Row 1 — Hero KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="商機總額"
          value={formatCurrency(data.pipeline.amount)}
          secondary={`${data.pipeline.count} 個進行中商機`}
          icon={GitBranch}
          accent="pipeline"
          trendLabel={`成案率 ${data.pipeline.winRate}%`}
        />
        <KpiCard
          label="預估營收"
          value={formatCurrency(data.pipeline.expectedRevenue)}
          secondary="依成案機率加權計算"
          icon={TrendingUp}
          accent="revenue"
          trendLabel={`${data.pipeline.winRate}% 加權`}
          trendDirection="up"
        />
        <KpiCard
          label="本月毛利"
          value={formatCurrency(data.revenue.profit)}
          secondary={`收入 ${formatCurrency(data.revenue.monthIncome)}`}
          icon={Wallet}
          accent="profit"
          trendLabel={`毛利率 ${margin}%`}
          trendDirection={data.revenue.profit >= 0 ? "up" : "down"}
        />
        <KpiCard
          label="進行中專案"
          value={String(data.project.executing)}
          secondary={`即將到期 ${data.project.upcoming} 個`}
          icon={FolderKanban}
          accent="primary"
          trendLabel={`${data.project.completed} 已完成`}
        />
      </div>

      {/* Row 2 — Revenue trend + Pipeline funnel */}
      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          title="營收趨勢"
          subtitle="近 6 個月轉撥金額"
          className="lg:col-span-3"
        >
          {transfers.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="尚無營收資料"
              description="建立第一筆轉撥後即可檢視營收趨勢。"
              className="h-[260px]"
            />
          ) : (
            <RevenueTrendChart data={revenueTrend} />
          )}
        </ChartCard>

        <ChartCard
          title="商機漏斗"
          subtitle="潛在 → 報價 → 成交 → 結案"
          className="lg:col-span-2"
          action={<Filter className="h-4 w-4 text-muted-foreground" />}
        >
          {pipelines.length === 0 ? (
            <EmptyState
              icon={GitBranch}
              title="尚無商機"
              description="建立第一個商機機會。"
              className="h-[220px]"
              action={
                <Link href="/pipelines" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
                  <Plus className="h-4 w-4" /> 新增商機
                </Link>
              }
            />
          ) : (
            <PipelineFunnel stages={funnel} />
          )}
        </ChartCard>
      </div>

      {/* Row 3 — Project health + Task status */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="專案健康度" subtitle="進行中專案風險分佈" action={<HeartPulse className="h-4 w-4 text-muted-foreground" />}>
          {projectHealth.active === 0 ? (
            <EmptyState icon={FolderKanban} title="尚無進行中專案" description="專案成立後即可追蹤健康度。" className="h-[176px]" />
          ) : (
            <DonutChart
              centerValue={String(projectHealth.active)}
              centerLabel="進行中"
              data={[
                { name: "正常", value: projectHealth.normal, color: CHART_COLORS.emerald },
                { name: "即將到期", value: projectHealth.risk, color: CHART_COLORS.amber },
                { name: "已延遲", value: projectHealth.delayed, color: CHART_COLORS.red },
              ]}
            />
          )}
        </ChartCard>

        <ChartCard title="任務狀態" subtitle="任務看板分佈" action={<ListChecks className="h-4 w-4 text-muted-foreground" />}>
          {taskStatus.total === 0 ? (
            <EmptyState icon={ListChecks} title="尚無任務" description="於專案中建立任務後即可檢視。" className="h-[176px]" />
          ) : (
            <DonutChart
              centerValue={String(taskStatus.total)}
              centerLabel="總任務"
              data={[
                { name: "待辦", value: taskStatus.todo, color: CHART_COLORS.slate },
                { name: "進行中", value: taskStatus.doing, color: CHART_COLORS.blue },
                { name: "審核中", value: taskStatus.review, color: CHART_COLORS.amber },
                { name: "完成", value: taskStatus.done, color: CHART_COLORS.emerald },
              ]}
            />
          )}
        </ChartCard>
      </div>

      {/* Row 4 — Recent activity + Top sales */}
      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard title="近期動態" subtitle="最新商機、報價與轉撥" className="lg:col-span-3" action={<Activity className="h-4 w-4 text-muted-foreground" />}>
          {activity.length === 0 ? (
            <EmptyState icon={Activity} title="尚無動態" description="開始建立商機、報價或轉撥。" className="h-[200px]" />
          ) : (
            <RecentActivity items={activity} />
          )}
        </ChartCard>

        <ChartCard title="業務排行榜" subtitle="轉撥金額 Top 5" className="lg:col-span-2" action={<Trophy className="h-4 w-4 text-muted-foreground" />}>
          {topSales.length === 0 ? (
            <EmptyState icon={Trophy} title="尚無轉撥資料" description="完成轉撥後即可產生排名。" className="h-[200px]" />
          ) : (
            <TopSales data={topSales} />
          )}
        </ChartCard>
      </div>

      {/* Row 5 — Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <QuickStat icon={Rocket} accentClass="bg-blue-50 text-blue-600" label="進行中專案" value={quickStats.executing} />
        <QuickStat icon={CalendarClock} accentClass="bg-amber-50 text-amber-600" label="即將到期" value={quickStats.upcoming} />
        <QuickStat icon={ClipboardCheck} accentClass="bg-purple-50 text-purple-600" label="待驗收" value={quickStats.acceptance} />
        <QuickStat icon={CheckCircle2} accentClass="bg-emerald-50 text-emerald-600" label="已完成" value={quickStats.completed} />
      </div>
    </div>
  );
}

function QuickStat({
  icon: Icon,
  accentClass,
  label,
  value,
}: {
  icon: typeof Rocket;
  accentClass: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:shadow-md">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-2xl font-bold leading-none text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-40" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-[320px] rounded-xl lg:col-span-3" />
        <Skeleton className="h-[320px] rounded-xl lg:col-span-2" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[240px] rounded-xl" />
        <Skeleton className="h-[240px] rounded-xl" />
      </div>
    </div>
  );
}
