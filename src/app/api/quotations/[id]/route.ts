import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, canViewInternalCost } from "@/lib/rbac";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { QuotationStatus, PipelineStatus, ProjectStatus } from "@prisma/client";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      items: true,
      internalCost: true,
      pipeline: { include: { customer: true, owner: { select: { name: true } } } },
      project: true,
    },
  });
  if (!quotation) return jsonError("找不到報價", 404);
  return jsonSuccess(quotation);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const { status } = await req.json();

  const quotation = await prisma.quotation.update({
    where: { id },
    data: { status: status as QuotationStatus },
    include: { pipeline: { include: { owner: true } }, project: true, internalCost: true },
  });

  if (status === "ACCEPTED") {
    await prisma.pipeline.update({
      where: { id: quotation.pipelineId },
      data: { status: PipelineStatus.WON },
    });

    const existingProject = await prisma.project.findUnique({
      where: { quotationId: id },
    });

    if (!existingProject) {
      const ic = quotation.internalCost;
      const internalTotal = ic
        ? Number(ic.labor) + Number(ic.travel) + Number(ic.risk) + Number(ic.misc)
        : 0;

      await prisma.project.create({
        data: {
          quotationId: id,
          managerId: quotation.pipeline.ownerId,
          status: ProjectStatus.PLANNING,
          income: quotation.totalPrice,
          cost: internalTotal,
          startDate: new Date(),
        },
      });
    }
  }

  return jsonSuccess(quotation);
}
