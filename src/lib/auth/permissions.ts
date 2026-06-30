import { Role } from "@prisma/client";

export type Permission =
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
