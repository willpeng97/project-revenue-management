import "server-only";
import { NextResponse } from "next/server";
import type { User as PrismaUser } from "@prisma/client";
import { getOrSyncCurrentUser } from "./current-user";
import { AuthError } from "./errors";

export type AuthResult =
  | { user: PrismaUser; error?: never }
  | { user?: never; error: NextResponse };

/**
 * Server-side guard for protected API routes.
 *
 * Resolves the current company user (provisioning on first login) and returns
 * it, or a ready-to-return `NextResponse`:
 * - 401 when the request is unauthenticated.
 * - 403 when the user is outside the allowed Microsoft Entra tenant / domain.
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const user = await getOrSyncCurrentUser();
    if (!user) {
      return { error: NextResponse.json({ error: "未授權" }, { status: 401 }) };
    }
    return { user };
  } catch (err) {
    if (err instanceof AuthError) {
      return {
        error: NextResponse.json({ error: err.message, code: err.code }, { status: err.status }),
      };
    }
    throw err;
  }
}
