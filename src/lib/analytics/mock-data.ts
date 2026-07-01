// Deterministic mock dataset for the Analytics module.
// This is presentation-only sample data — it does not touch the API, DB or auth.

import { subMonths, format } from "date-fns";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ProjectStatus = "PLANNING" | "EXECUTING" | "ACCEPTANCE" | "CLOSED";
export type ProjectHealth = "normal" | "risk" | "delayed";
export type PipelineStage =
  | "POTENTIAL"
  | "CONTACTED"
  | "QUOTATION"
  | "NEGOTIATION"
  | "WON"
  | "LOST";
export type TransferType = "NORMAL" | "HOLIDAY" | "ADDITIONAL" | "ADJUSTMENT";
export type ProjectType = "NEW_DEVELOPMENT" | "MAINTENANCE" | "CONSULTING" | "OTHER";
export type TaskStatus = "TODO" | "DOING" | "REVIEW" | "DONE";

export interface SalesRep {
  id: string;
  name: string;
  initial: string;
  target: number;
}
export interface Customer {
  id: string;
  name: string;
  industry: string;
}
export interface MonthPoint {
  key: string;
  label: string;
  monthIndex: number; // 0 = 11 months ago … 11 = current month
}
export interface RevenueMonth extends MonthPoint {
  revenue: number;
  cost: number;
  profit: number;
}
export interface Project {
  id: string;
  name: string;
  customerId: string;
  salesId: string;
  type: ProjectType;
  status: ProjectStatus;
  health: ProjectHealth;
  revenue: number;
  cost: number;
  progress: number;
  monthIndex: number;
  overBudget: boolean;
  delayDays: number;
}
export interface Pipeline {
  id: string;
  title: string;
  customerId: string;
  salesId: string;
  stage: PipelineStage;
  type: ProjectType;
  industry: string;
  amount: number;
  probability: number;
  monthIndex: number;
}
export interface Transfer {
  id: string;
  projectId: string;
  salesId: string;
  department: string;
  amount: number;
  type: TransferType;
  monthIndex: number;
}
export interface ActivityEvent {
  id: string;
  type: "pipeline" | "quotation" | "transfer" | "workorder" | "project";
  title: string;
  monthIndex: number;
  dayOffset: number;
}

/* ------------------------------------------------------------------ */
/* Deterministic RNG                                                   */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260701);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)];
const between = (min: number, max: number) => min + rnd() * (max - min);
const intBetween = (min: number, max: number) => Math.round(between(min, max));

/* ------------------------------------------------------------------ */
/* Reference data                                                      */
/* ------------------------------------------------------------------ */

export const INDUSTRIES = ["半導體", "金融", "電信", "製造", "零售", "醫療", "政府", "教育"] as const;
export const DEPARTMENTS = ["業務一部", "業務二部", "顧問部", "研發部", "維運部"] as const;

const now = new Date();
export const MONTHS: MonthPoint[] = Array.from({ length: 12 }).map((_, i) => {
  const d = subMonths(now, 11 - i);
  return { key: format(d, "yyyy-MM"), label: format(d, "M月"), monthIndex: i };
});

const SALES_NAMES = ["陳美玲", "林志豪", "王大明", "張家豪", "李小華", "黃淑芬", "吳建宏", "劉雅婷"];
export const SALES_REPS: SalesRep[] = SALES_NAMES.map((name, i) => ({
  id: `s${i + 1}`,
  name,
  initial: name.charAt(0),
  target: intBetween(30, 60) * 1_000_000,
}));

const CUSTOMER_NAMES = [
  "台積電", "鴻海精密", "中華電信", "國泰金控", "統一企業", "台達電", "聯發科", "富邦金控",
  "廣達電腦", "台塑石化", "遠傳電信", "和泰汽車", "長庚醫療", "宏碁電腦", "中鋼集團",
];
export const CUSTOMERS: Customer[] = CUSTOMER_NAMES.map((name, i) => ({
  id: `c${i + 1}`,
  name: `${name}`,
  industry: INDUSTRIES[i % INDUSTRIES.length],
}));

const PROJECT_STATUSES: ProjectStatus[] = ["PLANNING", "EXECUTING", "ACCEPTANCE", "CLOSED"];
const PROJECT_TYPES: ProjectType[] = ["NEW_DEVELOPMENT", "MAINTENANCE", "CONSULTING", "OTHER"];
const PROJECT_PREFIX = ["ERP", "MES", "CRM", "BI", "資安", "雲端", "AI", "資料倉儲", "行動", "供應鏈"];
const PROJECT_SUFFIX = ["建置案", "升級案", "維護案", "顧問案", "整合案", "導入案", "改版案"];

export const PROJECTS: Project[] = Array.from({ length: 30 }).map((_, i) => {
  const revenue = intBetween(2, 25) * 1_000_000;
  const marginRate = between(0.08, 0.45);
  const cost = Math.round(revenue * (1 - marginRate));
  const status = pick(PROJECT_STATUSES);
  const health: ProjectHealth = pick(["normal", "normal", "normal", "risk", "delayed"]);
  const delayDays = health === "delayed" ? intBetween(3, 40) : 0;
  return {
    id: `p${i + 1}`,
    name: `${pick(PROJECT_PREFIX)} ${pick(PROJECT_SUFFIX)}`,
    customerId: pick(CUSTOMERS).id,
    salesId: pick(SALES_REPS).id,
    type: pick(PROJECT_TYPES),
    status,
    health: status === "CLOSED" ? "normal" : health,
    revenue,
    cost,
    progress: status === "CLOSED" ? 100 : intBetween(10, 95),
    monthIndex: intBetween(0, 11),
    overBudget: rnd() > 0.78,
    delayDays,
  };
});

const PIPELINE_STAGES: PipelineStage[] = [
  "POTENTIAL", "CONTACTED", "QUOTATION", "NEGOTIATION", "WON", "LOST",
];
const STAGE_PROB: Record<PipelineStage, [number, number]> = {
  POTENTIAL: [5, 20],
  CONTACTED: [20, 40],
  QUOTATION: [40, 60],
  NEGOTIATION: [60, 85],
  WON: [100, 100],
  LOST: [0, 0],
};

export const PIPELINES: Pipeline[] = Array.from({ length: 100 }).map((_, i) => {
  const customer = pick(CUSTOMERS);
  const stage = pick(PIPELINE_STAGES);
  const [pMin, pMax] = STAGE_PROB[stage];
  return {
    id: `pl${i + 1}`,
    title: `${pick(PROJECT_PREFIX)} ${pick(PROJECT_SUFFIX)}`,
    customerId: customer.id,
    salesId: pick(SALES_REPS).id,
    stage,
    type: pick(PROJECT_TYPES),
    industry: customer.industry,
    amount: intBetween(1, 30) * 1_000_000,
    probability: intBetween(pMin, pMax),
    monthIndex: intBetween(0, 11),
  };
});

const TRANSFER_TYPES: TransferType[] = ["NORMAL", "HOLIDAY", "ADDITIONAL", "ADJUSTMENT"];
export const TRANSFERS: Transfer[] = Array.from({ length: 50 }).map((_, i) => {
  const project = pick(PROJECTS);
  return {
    id: `t${i + 1}`,
    projectId: project.id,
    salesId: project.salesId,
    department: pick(DEPARTMENTS),
    amount: intBetween(2, 20) * 100_000,
    type: pick(TRANSFER_TYPES),
    monthIndex: intBetween(0, 11),
  };
});

// Independent, upward-trending monthly revenue/cost series.
export const REVENUE_MONTHS: RevenueMonth[] = MONTHS.map((m, i) => {
  const base = 8_000_000 + i * 900_000;
  const revenue = Math.round(base * between(0.85, 1.25));
  const cost = Math.round(revenue * between(0.6, 0.82));
  return { ...m, revenue, cost, profit: revenue - cost };
});

const TASK_STATUSES: TaskStatus[] = ["TODO", "DOING", "REVIEW", "DONE"];
export const TASKS = Array.from({ length: 140 }).map((_, i) => ({
  id: `tk${i + 1}`,
  status: pick(TASK_STATUSES),
}));

const ACTIVITY_TYPES: ActivityEvent["type"][] = [
  "pipeline", "quotation", "transfer", "workorder", "project",
];
const ACTIVITY_TITLES: Record<ActivityEvent["type"], string> = {
  pipeline: "新增商機",
  quotation: "報價已核准",
  transfer: "建立轉撥",
  workorder: "工作支援單完成",
  project: "專案已結案",
};
export const ACTIVITIES: ActivityEvent[] = Array.from({ length: 12 })
  .map((_, i) => {
    const type = ACTIVITY_TYPES[i % ACTIVITY_TYPES.length];
    const project = pick(PROJECTS);
    return {
      id: `a${i + 1}`,
      type,
      title: `${ACTIVITY_TITLES[type]} · ${project.name}`,
      monthIndex: 11,
      dayOffset: i,
    };
  })
  .sort((a, b) => a.dayOffset - b.dayOffset);

export const customerName = (id: string) => CUSTOMERS.find((c) => c.id === id)?.name ?? "未知客戶";
export const salesName = (id: string) => SALES_REPS.find((s) => s.id === id)?.name ?? "未知業務";
