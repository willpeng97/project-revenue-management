import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { WorkOrderStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const projectId = req.nextUrl.searchParams.get("projectId");

  const workOrders = await prisma.workOrder.findMany({
    where: projectId ? { projectId } : undefined,
    include: {
      project: { select: { id: true, quotation: { select: { pipeline: { select: { title: true } } } } } },
      customer: true,
      engineer: { select: { id: true, name: true } },
    },
    orderBy: { serviceDate: "desc" },
  });
  return jsonSuccess(workOrders);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const { projectId, customerId, serviceDate, description, engineerId, attachmentUrl, customerSignature, status } =
    await req.json();
  if (!projectId || !customerId || !serviceDate || !description) {
    return jsonError("請填寫必要欄位");
  }

  const workOrder = await prisma.workOrder.create({
    data: {
      projectId,
      customerId,
      serviceDate: new Date(serviceDate),
      description,
      engineerId: engineerId || auth.user.sub,
      attachmentUrl,
      customerSignature,
      status: (status as WorkOrderStatus) || WorkOrderStatus.DRAFT,
    },
    include: {
      customer: true,
      engineer: { select: { name: true } },
      project: { select: { quotation: { select: { pipeline: { select: { title: true } } } } } },
    },
  });
  return jsonSuccess(workOrder, 201);
}
