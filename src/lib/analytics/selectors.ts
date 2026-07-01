import {
  PROJECTS,
  PIPELINES,
  TRANSFERS,
  REVENUE_MONTHS,
  TASKS,
  CUSTOMERS,
  SALES_REPS,
  MONTHS,
  DEPARTMENTS,
  INDUSTRIES,
  customerName,
  salesName,
  type Project,
  type Pipeline,
  type Transfer,
  type ProjectStatus,
  type ProjectType,
  type PipelineStage,
  type TransferType,
} from "./mock-data";

export type DatePreset = "month" | "quarter" | "year" | "custom";

export interface AnalyticsFilters {
  preset: DatePreset;
  months: number; // trailing-month window
  salesId: string; // "all" or id
  customerId: string; // "all" or id
  status: ProjectStatus | "all";
  projectType: ProjectType | "all";
}

export const DEFAULT_FILTERS: AnalyticsFilters = {
  preset: "year",
  months: 12,
  salesId: "all",
  customerId: "all",
  status: "all",
  projectType: "all",
};

export const PRESET_MONTHS: Record<DatePreset, number> = {
  month: 1,
  quarter: 3,
  year: 12,
  custom: 12,
};

const startIndex = (f: AnalyticsFilters) => 12 - f.months;

/* --------------------------- Formatting --------------------------- */

export function formatCompact(value: number) {
  const v = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (v >= 1e8) return `${sign}${(v / 1e8).toFixed(1)}億`;
  if (v >= 1e4) return `${sign}${Math.round(v / 1e4)}萬`;
  return `${sign}${Math.round(v)}`;
}
export function formatMoneyCompact(value: number) {
  return `NT$${formatCompact(value)}`;
}
export function formatPercent(value: number, digits = 0) {
  return `${value.toFixed(digits)}%`;
}

/* ----------------------------- Filters ---------------------------- */

export function filteredProjects(f: AnalyticsFilters): Project[] {
  const s = startIndex(f);
  return PROJECTS.filter(
    (p) =>
      p.monthIndex >= s &&
      (f.salesId === "all" || p.salesId === f.salesId) &&
      (f.customerId === "all" || p.customerId === f.customerId) &&
      (f.status === "all" || p.status === f.status) &&
      (f.projectType === "all" || p.type === f.projectType)
  );
}

export function filteredPipelines(f: AnalyticsFilters): Pipeline[] {
  const s = startIndex(f);
  return PIPELINES.filter(
    (p) =>
      p.monthIndex >= s &&
      (f.salesId === "all" || p.salesId === f.salesId) &&
      (f.customerId === "all" || p.customerId === f.customerId) &&
      (f.projectType === "all" || p.type === f.projectType)
  );
}

export function filteredTransfers(f: AnalyticsFilters): Transfer[] {
  const s = startIndex(f);
  const customerProjectIds = new Set(
    f.customerId === "all" ? [] : PROJECTS.filter((p) => p.customerId === f.customerId).map((p) => p.id)
  );
  return TRANSFERS.filter(
    (t) =>
      t.monthIndex >= s &&
      (f.salesId === "all" || t.salesId === f.salesId) &&
      (f.customerId === "all" || customerProjectIds.has(t.projectId))
  );
}

export function revenueSeries(f: AnalyticsFilters) {
  return REVENUE_MONTHS.slice(startIndex(f));
}

/* ------------------------------ KPIs ------------------------------ */

export function revenueKpis(f: AnalyticsFilters) {
  const series = revenueSeries(f);
  const revenue = series.reduce((s, m) => s + m.revenue, 0);
  const cost = series.reduce((s, m) => s + m.cost, 0);
  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const last = series[series.length - 1];
  const prev = series[series.length - 2] ?? last;
  const delta = (cur: number, before: number) =>
    before > 0 ? ((cur - before) / before) * 100 : 0;

  return {
    revenue,
    cost,
    profit,
    margin,
    spark: series.map((m) => m.revenue),
    costSpark: series.map((m) => m.cost),
    profitSpark: series.map((m) => m.profit),
    marginSpark: series.map((m) => (m.revenue > 0 ? (m.profit / m.revenue) * 100 : 0)),
    trend: last && prev
      ? {
          revenue: delta(last.revenue, prev.revenue),
          cost: delta(last.cost, prev.cost),
          profit: delta(last.profit, prev.profit),
          margin:
            (last.revenue > 0 ? (last.profit / last.revenue) * 100 : 0) -
            (prev.revenue > 0 ? (prev.profit / prev.revenue) * 100 : 0),
        }
      : { revenue: 0, cost: 0, profit: 0, margin: 0 },
  };
}

/* ---------------------------- Pipeline ---------------------------- */

const STAGE_LABELS: Record<PipelineStage, string> = {
  POTENTIAL: "潛在",
  CONTACTED: "接洽",
  QUOTATION: "報價",
  NEGOTIATION: "議約",
  WON: "成交",
  LOST: "失單",
};

export function pipelineFunnel(f: AnalyticsFilters) {
  const rows = filteredPipelines(f);
  const order: PipelineStage[] = ["POTENTIAL", "CONTACTED", "QUOTATION", "NEGOTIATION", "WON"];
  return order.map((stage) => {
    const items = rows.filter((r) => r.stage === stage);
    return {
      stage,
      label: STAGE_LABELS[stage],
      count: items.length,
      amount: items.reduce((s, r) => s + r.amount, 0),
    };
  });
}

export function pipelineStats(f: AnalyticsFilters) {
  const rows = filteredPipelines(f);
  const won = rows.filter((r) => r.stage === "WON").length;
  const lost = rows.filter((r) => r.stage === "LOST").length;
  const decided = won + lost;
  const openRows = rows.filter((r) => r.stage !== "WON" && r.stage !== "LOST");
  return {
    total: rows.length,
    won,
    lost,
    conversionRate: decided > 0 ? (won / decided) * 100 : 0,
    avgDealSize: rows.length > 0 ? rows.reduce((s, r) => s + r.amount, 0) / rows.length : 0,
    openValue: openRows.reduce((s, r) => s + r.amount, 0),
    weightedForecast: openRows.reduce((s, r) => s + (r.amount * r.probability) / 100, 0),
  };
}

export function pipelineBy(f: AnalyticsFilters, key: "salesId" | "customerId" | "industry") {
  const rows = filteredPipelines(f);
  const map = new Map<string, { amount: number; count: number }>();
  for (const r of rows) {
    const k = r[key];
    const cur = map.get(k) ?? { amount: 0, count: 0 };
    cur.amount += r.amount;
    cur.count += 1;
    map.set(k, cur);
  }
  return [...map.entries()]
    .map(([k, v]) => ({
      key: k,
      label: key === "salesId" ? salesName(k) : key === "customerId" ? customerName(k) : k,
      ...v,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function pipelineForecast(f: AnalyticsFilters) {
  const rows = filteredPipelines(f).filter((r) => r.stage !== "WON" && r.stage !== "LOST");
  return MONTHS.map((m) => ({
    label: m.label,
    value: rows
      .filter((r) => r.monthIndex === m.monthIndex)
      .reduce((s, r) => s + (r.amount * r.probability) / 100, 0),
  }));
}

/* ---------------------------- Projects ---------------------------- */

export function projectHealth(f: AnalyticsFilters) {
  const rows = filteredProjects(f);
  return {
    normal: rows.filter((p) => p.status !== "CLOSED" && p.health === "normal").length,
    risk: rows.filter((p) => p.status !== "CLOSED" && p.health === "risk").length,
    delayed: rows.filter((p) => p.status !== "CLOSED" && p.health === "delayed").length,
    closed: rows.filter((p) => p.status === "CLOSED").length,
  };
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "規劃中",
  EXECUTING: "執行中",
  ACCEPTANCE: "驗收中",
  CLOSED: "已結案",
};

export function projectStatusBreakdown(f: AnalyticsFilters) {
  const rows = filteredProjects(f);
  return (["PLANNING", "EXECUTING", "ACCEPTANCE", "CLOSED"] as ProjectStatus[]).map((s) => ({
    label: STATUS_LABELS[s],
    value: rows.filter((p) => p.status === s).length,
  }));
}

export interface ProjectRow {
  id: string;
  name: string;
  customer: string;
  sales: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  status: ProjectStatus;
  statusLabel: string;
  health: Project["health"];
  progress: number;
  overBudget: boolean;
  delayDays: number;
}

export function projectRows(f: AnalyticsFilters): ProjectRow[] {
  return filteredProjects(f).map((p) => {
    const profit = p.revenue - p.cost;
    return {
      id: p.id,
      name: p.name,
      customer: customerName(p.customerId),
      sales: salesName(p.salesId),
      revenue: p.revenue,
      cost: p.cost,
      profit,
      margin: p.revenue > 0 ? (profit / p.revenue) * 100 : 0,
      status: p.status,
      statusLabel: STATUS_LABELS[p.status],
      health: p.health,
      progress: p.progress,
      overBudget: p.overBudget,
      delayDays: p.delayDays,
    };
  });
}

export function projectCompletionRate(f: AnalyticsFilters) {
  const rows = filteredProjects(f);
  const closed = rows.filter((p) => p.status === "CLOSED").length;
  return rows.length > 0 ? (closed / rows.length) * 100 : 0;
}

/* ------------------------------ Sales ----------------------------- */

export interface SalesRow {
  id: string;
  name: string;
  initial: string;
  revenue: number;
  wonProjects: number;
  winRate: number;
  avgDealSize: number;
  pipelineValue: number;
  conversionRate: number;
  target: number;
  achievement: number;
}

export function salesLeaderboard(f: AnalyticsFilters): SalesRow[] {
  const projects = filteredProjects({ ...f, salesId: "all" });
  const pipelines = filteredPipelines({ ...f, salesId: "all" });
  return SALES_REPS.map((rep) => {
    const repProjects = projects.filter((p) => p.salesId === rep.id);
    const revenue = repProjects.reduce((s, p) => s + p.revenue, 0);
    const repPipes = pipelines.filter((p) => p.salesId === rep.id);
    const won = repPipes.filter((p) => p.stage === "WON").length;
    const lost = repPipes.filter((p) => p.stage === "LOST").length;
    const decided = won + lost;
    const open = repPipes.filter((p) => p.stage !== "WON" && p.stage !== "LOST");
    return {
      id: rep.id,
      name: rep.name,
      initial: rep.initial,
      revenue,
      wonProjects: won,
      winRate: decided > 0 ? (won / decided) * 100 : 0,
      avgDealSize: repProjects.length > 0 ? revenue / repProjects.length : 0,
      pipelineValue: open.reduce((s, p) => s + p.amount, 0),
      conversionRate: repPipes.length > 0 ? (won / repPipes.length) * 100 : 0,
      target: rep.target,
      achievement: rep.target > 0 ? (revenue / rep.target) * 100 : 0,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

/* ---------------------------- Transfers --------------------------- */

const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
  NORMAL: "一般",
  HOLIDAY: "假日",
  ADDITIONAL: "追加",
  ADJUSTMENT: "調整",
};

export function transferTrend(f: AnalyticsFilters) {
  const rows = filteredTransfers(f);
  return MONTHS.slice(startIndex(f)).map((m) => ({
    label: m.label,
    value: rows.filter((t) => t.monthIndex === m.monthIndex).reduce((s, t) => s + t.amount, 0),
  }));
}

export function transferByType(f: AnalyticsFilters) {
  const rows = filteredTransfers(f);
  return (Object.keys(TRANSFER_TYPE_LABELS) as TransferType[]).map((type) => ({
    label: TRANSFER_TYPE_LABELS[type],
    value: rows.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0),
    count: rows.filter((t) => t.type === type).length,
  }));
}

export function transferBy(f: AnalyticsFilters, key: "salesId" | "department" | "projectId") {
  const rows = filteredTransfers(f);
  const map = new Map<string, number>();
  for (const t of rows) map.set(t[key], (map.get(t[key]) ?? 0) + t.amount);
  return [...map.entries()]
    .map(([k, amount]) => ({
      key: k,
      label:
        key === "salesId"
          ? salesName(k)
          : key === "projectId"
            ? PROJECTS.find((p) => p.id === k)?.name ?? k
            : k,
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function transferStats(f: AnalyticsFilters) {
  const rows = filteredTransfers(f);
  const total = rows.reduce((s, t) => s + t.amount, 0);
  return {
    total,
    count: rows.length,
    average: rows.length > 0 ? total / rows.length : 0,
    frequency: rows.length / Math.max(f.months, 1),
  };
}

/* ---------------------------- Customers --------------------------- */

export interface CustomerRow {
  id: string;
  name: string;
  industry: string;
  revenue: number;
  profit: number;
  projects: number;
  ltv: number;
  recurring: number;
}

export function customerRows(f: AnalyticsFilters): CustomerRow[] {
  const projects = filteredProjects({ ...f, customerId: "all" });
  return CUSTOMERS.map((c) => {
    const cp = projects.filter((p) => p.customerId === c.id);
    const revenue = cp.reduce((s, p) => s + p.revenue, 0);
    const profit = cp.reduce((s, p) => s + (p.revenue - p.cost), 0);
    return {
      id: c.id,
      name: c.name,
      industry: c.industry,
      revenue,
      profit,
      projects: cp.length,
      ltv: Math.round(revenue * 1.6),
      recurring: cp.filter((p) => p.type === "MAINTENANCE").reduce((s, p) => s + p.revenue, 0),
    };
  })
    .filter((c) => c.projects > 0)
    .sort((a, b) => b.revenue - a.revenue);
}

export function industryDistribution(f: AnalyticsFilters) {
  const rows = customerRows(f);
  return INDUSTRIES.map((ind) => ({
    label: ind,
    value: rows.filter((c) => c.industry === ind).reduce((s, c) => s + c.revenue, 0),
  })).filter((d) => d.value > 0);
}

/* ------------------------- Revenue breakdowns --------------------- */

export function revenueByCustomer(f: AnalyticsFilters) {
  return customerRows(f).map((c) => ({ label: c.name, value: c.revenue })).slice(0, 8);
}
export function revenueBySales(f: AnalyticsFilters) {
  return salesLeaderboard(f).map((s) => ({ label: s.name, value: s.revenue }));
}
export function revenueByProject(f: AnalyticsFilters) {
  return projectRows(f)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((p) => ({ label: p.name, value: p.revenue }));
}

/* ---------------------------- Task dist --------------------------- */

export function taskDistribution() {
  const count = (s: string) => TASKS.filter((t) => t.status === s).length;
  return [
    { label: "待辦", value: count("TODO") },
    { label: "進行中", value: count("DOING") },
    { label: "審核中", value: count("REVIEW") },
    { label: "完成", value: count("DONE") },
  ];
}

export { DEPARTMENTS };
