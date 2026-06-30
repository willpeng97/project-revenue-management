import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { PipelineStatus, PipelineType } from "@prisma/client";
import { toDecimal, calcExpectedRevenue } from "@/lib/decimal";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pipeline = await prisma.pipeline.findUnique({
    where: { id },
    include: {
      customer: true,
      owner: { select: { id: true, name: true } },
      quotations: {
        include: { items: true },
        orderBy: { version: "desc" },
      },
    },
  });
  if (!pipeline) return jsonError("找不到商機", 404);
  return jsonSuccess(pipeline);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.title) data.title = body.title;
  if (body.type) data.type = body.type as PipelineType;
  if (body.status) data.status = body.status as PipelineStatus;
  if (body.ownerId) data.ownerId = body.ownerId;
  if (body.cost != null || body.successRate != null) {
    const existing = await prisma.pipeline.findUnique({ where: { id } });
    if (!existing) return jsonError("找不到商機", 404);
    const cost = body.cost != null ? parseFloat(body.cost) : Number(existing.cost);
    const rate = body.successRate != null ? parseInt(body.successRate, 10) : existing.successRate;
    data.cost = toDecimal(cost);
    data.successRate = rate;
    data.expectedRevenue = calcExpectedRevenue(cost, rate);
  }

  const pipeline = await prisma.pipeline.update({
    where: { id },
    data,
    include: { customer: true, owner: { select: { id: true, name: true } } },
  });
  return jsonSuccess(pipeline);
}
