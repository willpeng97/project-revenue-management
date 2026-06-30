import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { toDecimal } from "@/lib/decimal";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const projectId = req.nextUrl.searchParams.get("projectId");

  const tasks = await prisma.task.findMany({
    where: projectId ? { projectId } : undefined,
    include: {
      assignee: { select: { id: true, name: true } },
      project: {
        select: {
          id: true,
          quotation: { select: { pipeline: { select: { title: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return jsonSuccess(tasks);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { projectId, title, description, status, priority, assigneeId, workHour, dueDate } =
    await req.json();
  if (!projectId || !title) return jsonError("請填寫必要欄位");

  const task = await prisma.task.create({
    data: {
      projectId,
      title,
      description,
      status: (status as TaskStatus) || TaskStatus.TODO,
      priority: (priority as TaskPriority) || TaskPriority.MEDIUM,
      assigneeId,
      workHour: toDecimal(workHour ?? 0),
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: { assignee: { select: { id: true, name: true } } },
  });
  return jsonSuccess(task, 201);
}
