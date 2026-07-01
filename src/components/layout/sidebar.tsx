"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { Role } from "@prisma/client";
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
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

export function Sidebar({ userName, role }: { userName: string; role: Role }) {
  const pathname = usePathname();
  const initial = userName?.trim().charAt(0).toUpperCase() || "U";

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-300">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
          <TrendingUp className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">M122 Revenue</p>
          <p className="text-[11px] text-slate-500">Project Revenue Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        <p className="px-3 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-wider text-slate-600">
          Menu
        </p>
        {navItems
          .filter((item) => !item.adminOnly || role === "ADMIN")
          .map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                  active
                    ? "bg-slate-800/80 font-medium text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-blue-500" />
                )}
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-transform group-hover:scale-110",
                    active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
            {initial}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="text-[11px] text-slate-500">{ROLE_LABELS[role]}</p>
          </div>
        </div>
        <SignOutButton redirectUrl="/login">
          <button className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-white">
            <LogOut className="h-4 w-4" />
            登出
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
