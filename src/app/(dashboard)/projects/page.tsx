"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useQuery({ queryKey: ["projects"], queryFn: api.projects });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">專案管理</h1>
        <p className="text-slate-500">成交後的專案執行與營收追蹤</p>
      </div>

      {isLoading ? <p>載入中...</p> : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{p.quotation.pipeline.title}</h3>
                      <Badge variant="blue">{PROJECT_STATUS_LABELS[p.status]}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      {p.quotation.pipeline.customer.name} · PM: {p.manager.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(p.startDate)} ~ {formatDate(p.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-600">收入 {formatCurrency(p.income)}</p>
                    <p className="text-red-500">成本 {formatCurrency(p.cost)}</p>
                    <p className="font-semibold">毛利 {formatCurrency(Number(p.income) - Number(p.cost))}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
