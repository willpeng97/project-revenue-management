import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { PipelineStatus, PipelineType } from "@prisma/client";
import { toDecimal, calcExpectedRevenue } from "@/lib/decimal";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const pipelines = await prisma.pipeline.findMany({
    include: {
      customer: true,
      owner: { select: { id: true, name: true, email: true } },
      quotations: { select: { id: true, version: true, status: true } },
      _count: { select: { quotations: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return jsonSuccess(pipelines);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const { customerId, title, type, cost, successRate, status, ownerId } = await req.json();
  if (!customerId || !title || cost == null) return jsonError("請填寫必要欄位");

  const costNum = parseFloat(cost);
  const rate = parseInt(successRate ?? 50, 10);

  const pipeline = await prisma.pipeline.create({
    data: {
      customerId,
      title,
      type: (type as PipelineType) || PipelineType.OTHER,
      cost: toDecimal(costNum),
      successRate: rate,
      expectedRevenue: calcExpectedRevenue(costNum, rate),
      status: (status as PipelineStatus) || PipelineStatus.POTENTIAL,
      ownerId: ownerId || auth.user.sub,
    },
    include: {
      customer: true,
      owner: { select: { id: true, name: true } },
    },
  });
  return jsonSuccess(pipeline, 201);
}
