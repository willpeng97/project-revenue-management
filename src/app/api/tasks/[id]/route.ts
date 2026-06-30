import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonSuccess } from "@/lib/api-helpers";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { toDecimal } from "@/lib/decimal";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await req.json();

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.status && { status: body.status as TaskStatus }),
      ...(body.priority && { priority: body.priority as TaskPriority }),
      ...(body.assigneeId !== undefined && { assigneeId: body.assigneeId }),
      ...(body.workHour != null && { workHour: toDecimal(body.workHour) }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
    },
    include: { assignee: { select: { id: true, name: true } } },
  });
  return jsonSuccess(task);
}
