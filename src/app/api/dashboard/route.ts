import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { jsonSuccess } from "@/lib/api-helpers";
import { decimalToNumber } from "@/lib/utils";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    pipelines,
    projects,
    tasks,
    monthTransfers,
    allTransfers,
    wonPipelines,
    totalPipelines,
  ] = await Promise.all([
    prisma.pipeline.findMany({
      where: { status: { not: "LOST" } },
      select: { cost: true, expectedRevenue: true, status: true },
    }),
    prisma.project.findMany({
      select: { status: true, income: true, cost: true, endDate: true },
    }),
    prisma.task.findMany({
      select: { status: true, dueDate: true },
    }),
    prisma.transfer.findMany({
      where: { date: { gte: monthStart, lte: monthEnd } },
      include: { creator: { select: { name: true } } },
    }),
    prisma.transfer.findMany({
      include: { creator: { select: { name: true } } },
    }),
    prisma.pipeline.count({ where: { status: "WON" } }),
    prisma.pipeline.count(),
  ]);

  const pipelineAmount = pipelines.reduce((s, p) => s + decimalToNumber(p.cost), 0);
  const expectedRevenue = pipelines.reduce((s, p) => s + decimalToNumber(p.expectedRevenue), 0);
  const winRate = totalPipelines > 0 ? Math.round((wonPipelines / totalPipelines) * 100) : 0;

  const monthIncome = projects
    .filter((p) => p.status !== "CLOSED")
    .reduce((s, p) => s + decimalToNumber(p.income), 0);

  const monthCost = projects.reduce((s, p) => s + decimalToNumber(p.cost), 0);
  const monthTransferTotal = monthTransfers.reduce((s, t) => s + decimalToNumber(t.amount), 0);

  const transferBySales = allTransfers.reduce<Record<string, number>>((acc, t) => {
    const name = t.creator.name;
    acc[name] = (acc[name] || 0) + decimalToNumber(t.amount);
    return acc;
  }, {});

  const executingProjects = projects.filter((p) => p.status === "EXECUTING").length;
  const upcomingDeadlines = projects.filter(
    (p) => p.endDate && p.endDate > now && p.endDate < new Date(now.getTime() + 30 * 86400000)
  ).length;
  const completedProjects = projects.filter((p) => p.status === "CLOSED").length;

  const todoTasks = tasks.filter((t) => t.status === "TODO").length;
  const doingTasks = tasks.filter((t) => t.status === "DOING").length;
  const delayedTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== "DONE"
  ).length;

  return jsonSuccess({
    pipeline: {
      count: pipelines.length,
      amount: pipelineAmount,
      winRate,
      expectedRevenue,
    },
    revenue: {
      monthIncome,
      monthCost,
      profit: monthIncome - monthCost,
    },
    transfer: {
      monthTotal: monthTransferTotal,
      bySales: Object.entries(transferBySales).map(([name, amount]) => ({ name, amount })),
    },
    project: {
      executing: executingProjects,
      upcoming: upcomingDeadlines,
      completed: completedProjects,
    },
    task: {
      todo: todoTasks,
      doing: doingTasks,
      delayed: delayedTasks,
    },
  });
}
