import "server-only";
import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requireAuth, type AuthResult } from "./require-auth";
import { hasPermission, type Permission } from "./permissions";

/**
 * Require an authenticated company user that holds a specific permission.
 * Returns 403 when authenticated but lacking the permission.
 */
export async function requirePermission(permission: Permission): Promise<AuthResult> {
  const result = await requireAuth();
  if (result.error) return result;
  if (!hasPermission(result.user.role, permission)) {
    return { error: NextResponse.json({ error: "權限不足" }, { status: 403 }) };
  }
  return result;
}

/**
 * Require an authenticated company user whose role is one of `roles`.
 * Returns 403 when authenticated but the role is not allowed.
 */
export async function requireRole(...roles: Role[]): Promise<AuthResult> {
  const result = await requireAuth();
  if (result.error) return result;
  if (!roles.includes(result.user.role)) {
    return { error: NextResponse.json({ error: "權限不足" }, { status: 403 }) };
  }
  return result;
}
