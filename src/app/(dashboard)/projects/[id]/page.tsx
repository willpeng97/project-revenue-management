"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PROJECT_STATUS_LABELS, TASK_STATUS_LABELS, TRANSFER_TYPE_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => api.project(id),
  });

  if (isLoading) return <p>載入中...</p>;
  if (!project) return <p>找不到專案</p>;

  const columns = ["TODO", "DOING", "REVIEW", "DONE"] as const;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{project.quotation.pipeline.title}</h1>
          <Badge variant="blue">{PROJECT_STATUS_LABELS[project.status]}</Badge>
        </div>
        <p className="text-slate-500">{project.quotation.pipeline.customer.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">收入</p><p className="text-xl font-bold text-green-600">{formatCurrency(project.income)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">成本</p><p className="text-xl font-bold text-red-500">{formatCurrency(project.cost)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-slate-500">毛利</p><p className="text-xl font-bold">{formatCurrency(Number(project.income) - Number(project.cost))}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>任務看板</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {columns.map((col) => (
              <div key={col} className="rounded-lg bg-slate-50 p-3">
                <h4 className="mb-3 text-sm font-medium">{TASK_STATUS_LABELS[col]}</h4>
                <div className="space-y-2">
                  {project.tasks.filter((t) => t.status === col).map((t) => (
                    <div key={t.id} className="rounded-lg bg-white p-3 shadow-sm">
                      <p className="text-sm font-medium">{t.title}</p>
                      {t.assignee && <p className="text-xs text-slate-400">{t.assignee.name}</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>轉撥紀錄</CardTitle></CardHeader>
        <CardContent>
          {project.transfers.length === 0 ? (
            <p className="text-sm text-slate-500">尚無轉撥紀錄</p>
          ) : (
            <div className="space-y-2">
              {project.transfers.map((t) => (
                <div key={t.id} className="flex justify-between rounded-lg bg-slate-50 px-4 py-2">
                  <div>
                    <span className="font-medium">{TRANSFER_TYPE_LABELS[t.type]}</span>
                    <span className="ml-2 text-sm text-slate-500">{formatDate(t.date)} · {t.creator.name}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(t.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
