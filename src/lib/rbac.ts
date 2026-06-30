import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getTokenFromRequest, verifyAccessToken, TokenPayload } from "./auth";

type Permission =
  | "manage_users"
  | "view_all"
  | "create_pipeline"
  | "create_quotation"
  | "create_customer"
  | "view_own_performance"
  | "create_transfer"
  | "view_internal_cost"
  | "manage_project"
  | "create_task"
  | "create_work_order"
  | "update_task"
  | "view_cost"
  | "view_profit"
  | "export_report";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "manage_users",
    "view_all",
    "create_pipeline",
    "create_quotation",
    "create_customer",
    "view_own_performance",
    "create_transfer",
    "view_internal_cost",
    "manage_project",
    "create_task",
    "create_work_order",
    "update_task",
    "view_cost",
    "view_profit",
    "export_report",
  ],
  SALES: [
    "create_pipeline",
    "create_quotation",
    "create_customer",
    "view_own_performance",
    "create_transfer",
  ],
  PM: [
    "manage_project",
    "create_task",
    "create_work_order",
    "view_cost",
    "view_internal_cost",
  ],
  RD: ["update_task", "create_work_order"],
  FINANCE: ["view_cost", "view_profit", "view_internal_cost", "export_report"],
};

export function hasPermission(role: Role, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canViewInternalCost(role: Role) {
  return hasPermission(role, "view_internal_cost");
}

export type AuthResult =
  | { user: TokenPayload; error?: never }
  | { user?: never; error: NextResponse };

export function requireAuth(req: NextRequest): AuthResult {
  const token = getTokenFromRequest(req);
  if (!token) {
    return { error: NextResponse.json({ error: "未授權" }, { status: 401 }) };
  }
  const user = verifyAccessToken(token);
  if (!user) {
    return { error: NextResponse.json({ error: "Token 無效或已過期" }, { status: 401 }) };
  }
  return { user };
}

export function requirePermission(req: NextRequest, permission: Permission): AuthResult {
  const result = requireAuth(req);
  if (result.error) return result;
  if (!hasPermission(result.user.role, permission)) {
    return { error: NextResponse.json({ error: "權限不足" }, { status: 403 }) };
  }
  return result;
}
