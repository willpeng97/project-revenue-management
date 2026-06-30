"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  FolderKanban,
  CheckSquare,
  ClipboardList,
  ArrowLeftRight,
  Users,
  Building2,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/api-client";
import { ROLE_LABELS } from "@/lib/constants";

const navItems = [
  { href: "/dashboard", label: "儀表板", icon: LayoutDashboard },
  { href: "/pipelines", label: "商機 Pipeline", icon: GitBranch },
  { href: "/quotations", label: "報價管理", icon: FileText },
  { href: "/projects", label: "專案管理", icon: FolderKanban },
  { href: "/tasks", label: "任務看板", icon: CheckSquare },
  { href: "/work-orders", label: "工作支援單", icon: ClipboardList },
  { href: "/transfers", label: "轉撥管理", icon: ArrowLeftRight },
  { href: "/customers", label: "客戶管理", icon: Building2 },
  { href: "/users", label: "使用者", icon: Users, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-white">
      <div className="border-b border-slate-700 px-6 py-5">
        <h1 className="text-lg font-bold">M122 營收管理</h1>
        <p className="mt-1 text-xs text-slate-400">Project Revenue Platform</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems
          .filter((item) => !item.adminOnly || user?.role === "ADMIN")
          .map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="border-t border-slate-700 p-4">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-slate-400">{user ? ROLE_LABELS[user.role] : ""}</p>
        </div>
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" />
          登出
        </button>
      </div>
    </aside>
  );
}
