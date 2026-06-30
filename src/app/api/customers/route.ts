import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  return jsonSuccess(customers);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const { name, taxId, contact, phone, email, address } = await req.json();
  if (!name) return jsonError("請輸入客戶名稱");

  const customer = await prisma.customer.create({
    data: { name, taxId, contact, phone, email, address },
  });
  return jsonSuccess(customer, 201);
}
