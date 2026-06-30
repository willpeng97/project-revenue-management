import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { TransferType } from "@prisma/client";
import { toDecimal } from "@/lib/decimal";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const projectId = req.nextUrl.searchParams.get("projectId");

  const transfers = await prisma.transfer.findMany({
    where: projectId ? { projectId } : undefined,
    include: {
      creator: { select: { id: true, name: true } },
      project: {
        select: {
          id: true,
          quotation: { select: { pipeline: { select: { title: true } } } },
        },
      },
    },
    orderBy: { date: "desc" },
  });
  return jsonSuccess(transfers);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const { projectId, amount, type, date, remark } = await req.json();
  if (!projectId || amount == null) return jsonError("請填寫必要欄位");

  const transfer = await prisma.transfer.create({
    data: {
      projectId,
      amount: toDecimal(amount),
      type: (type as TransferType) || TransferType.NORMAL,
      date: date ? new Date(date) : new Date(),
      remark,
      createdBy: auth.user.id,
    },
    include: {
      creator: { select: { name: true } },
      project: { select: { quotation: { select: { pipeline: { select: { title: true } } } } } },
    },
  });
  return jsonSuccess(transfer, 201);
}
