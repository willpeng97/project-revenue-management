import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { ProjectStatus } from "@prisma/client";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      manager: { select: { id: true, name: true } },
      quotation: {
        include: {
          pipeline: { include: { customer: true } },
          items: true,
          internalCost: true,
        },
      },
      tasks: { include: { assignee: { select: { id: true, name: true } } } },
      transfers: { include: { creator: { select: { name: true } } }, orderBy: { date: "desc" } },
      workOrders: { include: { engineer: { select: { name: true } }, customer: true } },
    },
  });
  if (!project) return jsonError("找不到專案", 404);
  return jsonSuccess(project);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await req.json();

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status as ProjectStatus }),
      ...(body.managerId && { managerId: body.managerId }),
      ...(body.startDate && { startDate: new Date(body.startDate) }),
      ...(body.endDate && { endDate: new Date(body.endDate) }),
    },
    include: { manager: { select: { name: true } } },
  });
  return jsonSuccess(project);
}
