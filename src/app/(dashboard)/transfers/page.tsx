"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency, formatDate, formValue, formValueOptional } from "@/lib/utils";
import { TRANSFER_TYPE_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function TransfersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { data: transfers = [], isLoading } = useQuery({ queryKey: ["transfers"], queryFn: () => api.transfers() });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: api.projects });

  const createMutation = useMutation({
    mutationFn: api.createTransfer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transfers"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); setShowForm(false); },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      projectId: formValue(fd, "projectId"),
      amount: formValue(fd, "amount"),
      type: formValue(fd, "type"),
      date: formValue(fd, "date"),
      remark: formValueOptional(fd, "remark"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">轉撥管理</h1>
          <p className="text-slate-500">專案營收轉撥紀錄（可多次、不限狀態）</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "取消" : "新增轉撥"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>新增轉撥</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">專案</label>
                <Select name="projectId" required>
                  <option value="">選擇專案</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.quotation.pipeline.title}</option>)}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">金額</label>
                <Input name="amount" type="number" required />
              </div>
              <div>
                <label className="mb-1 block text-sm">類型</label>
                <Select name="type">
                  {Object.entries(TRANSFER_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">日期</label>
                <Input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm">備註</label>
                <Input name="remark" />
              </div>
              <div className="md:col-span-2"><Button type="submit">建立轉撥</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <p>載入中...</p> : (
        <div className="grid gap-4">
          {transfers.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue">{TRANSFER_TYPE_LABELS[t.type]}</Badge>
                    <span className="text-sm text-slate-500">{formatDate(t.date)}</span>
                  </div>
                  <p className="text-sm">{t.project?.quotation?.pipeline?.title}</p>
                  <p className="text-xs text-slate-400">{t.creator.name} · {t.remark}</p>
                </div>
                <p className="text-lg font-bold">{formatCurrency(t.amount)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
