import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, canViewInternalCost } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { QuotationStatus } from "@prisma/client";
import { toDecimal } from "@/lib/decimal";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const quotations = await prisma.quotation.findMany({
    include: {
      pipeline: { include: { customer: true } },
      items: true,
      internalCost: canViewInternalCost(auth.user.role),
      project: { select: { id: true, status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const result = quotations.map((q) => {
    if (!canViewInternalCost(auth.user.role)) {
      const { internalCost: _, ...rest } = q;
      return rest;
    }
    return q;
  });

  return jsonSuccess(result);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { pipelineId, paymentTerms, items, internalCost } = await req.json();
  if (!pipelineId || !items?.length) return jsonError("請填寫報價資料");

  const lastVersion = await prisma.quotation.findFirst({
    where: { pipelineId },
    orderBy: { version: "desc" },
  });
  const version = (lastVersion?.version ?? 0) + 1;

  const totalPrice = items.reduce(
    (sum: number, item: { amount: number }) => sum + parseFloat(String(item.amount)),
    0
  );

  const quotation = await prisma.quotation.create({
    data: {
      pipelineId,
      version,
      paymentTerms,
      totalPrice: toDecimal(totalPrice),
      status: QuotationStatus.DRAFT,
      items: {
        create: items.map((item: { name: string; description?: string; unitPrice: number; manDay?: number; amount: number }) => ({
          name: item.name,
          description: item.description,
          unitPrice: toDecimal(item.unitPrice),
          manDay: toDecimal(item.manDay ?? 0),
          amount: toDecimal(item.amount),
        })),
      },
      ...(canViewInternalCost(auth.user.role) && internalCost
        ? {
            internalCost: {
              create: {
                labor: toDecimal(internalCost.labor ?? 0),
                travel: toDecimal(internalCost.travel ?? 0),
                risk: toDecimal(internalCost.risk ?? 0),
                misc: toDecimal(internalCost.misc ?? 0),
              },
            },
          }
        : {}),
    },
    include: {
      items: true,
      internalCost: canViewInternalCost(auth.user.role),
      pipeline: { include: { customer: true } },
    },
  });

  await prisma.pipeline.update({
    where: { id: pipelineId },
    data: { status: "QUOTATION" },
  });

  return jsonSuccess(quotation, 201);
}
