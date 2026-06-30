import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/rbac";
import { hashPassword } from "@/lib/auth";
import { jsonError, jsonSuccess } from "@/lib/api-helpers";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return jsonSuccess(users);
}

export async function POST(req: NextRequest) {
  const auth = requirePermission(req, "manage_users");
  if (auth.error) return auth.error;

  const { email, password, name, role } = await req.json();
  if (!email || !password || !name) return jsonError("請填寫完整資料");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return jsonError("Email 已存在");

  const user = await prisma.user.create({
    data: {
      email,
      password: await hashPassword(password),
      name,
      role: (role as Role) || Role.SALES,
    },
    select: { id: true, email: true, name: true, role: true },
  });
  return jsonSuccess(user, 201);
}
