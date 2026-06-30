import "server-only";
import { auth } from "@clerk/nextjs/server";
import type { User as PrismaUser } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { syncCurrentUser } from "./sync-user";

/**
 * Return the Prisma `User` for the active Clerk session without provisioning.
 *
 * Returns `null` when unauthenticated or when no database record exists yet
 * (e.g. before the first {@link syncCurrentUser} call).
 */
export async function getCurrentUser(): Promise<PrismaUser | null> {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.user.findUnique({ where: { clerkId: userId } });
}

/**
 * Return the Prisma `User` for the active Clerk session, provisioning it on
 * first login. Throws an {@link AuthError} for users outside the allowed
 * tenant/domain. Returns `null` only when there is no active Clerk session.
 */
export async function getOrSyncCurrentUser(): Promise<PrismaUser | null> {
  const existing = await getCurrentUser();
  if (existing) {
    return existing;
  }
  return syncCurrentUser();
}
