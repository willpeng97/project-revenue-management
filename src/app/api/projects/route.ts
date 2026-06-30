import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonSuccess } from "@/lib/api-helpers";

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  const projects = await prisma.project.findMany({
    include: {
      manager: { select: { id: true, name: true } },
      quotation: {
        include: {
          pipeline: { include: { customer: true } },
        },
      },
      _count: { select: { tasks: true, transfers: true, workOrders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return jsonSuccess(projects);
}
