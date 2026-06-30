import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/rbac";
import { jsonSuccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (auth.error) return auth.error;

  const user = await prisma.user.findUnique({
    where: { id: auth.user.sub },
    select: { id: true, email: true, name: true, role: true },
  });

  return jsonSuccess({ user });
}
