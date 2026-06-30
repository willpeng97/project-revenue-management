"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency, formValue } from "@/lib/utils";
import { QUOTATION_STATUS_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function QuotationsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { data: quotations = [], isLoading } = useQuery({ queryKey: ["quotations"], queryFn: api.quotations });
  const { data: pipelines = [] } = useQuery({ queryKey: ["pipelines"], queryFn: api.pipelines });

  const createMutation = useMutation({
    mutationFn: api.createQuotation,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotations"] }); setShowForm(false); },
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.updateQuotation(id, { status: "ACCEPTED" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["pipelines"] });
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const unitPrice = parseFloat(formValue(fd, "unitPrice"));
    const manDay = parseFloat(formValue(fd, "manDay"));
    createMutation.mutate({
      pipelineId: formValue(fd, "pipelineId"),
      paymentTerms: formValue(fd, "paymentTerms"),
      items: [{ name: formValue(fd, "itemName"), unitPrice, manDay, amount: unitPrice * manDay }],
      internalCost: {
        labor: parseFloat(formValue(fd, "labor")) || 0,
        travel: parseFloat(formValue(fd, "travel")) || 0,
        risk: parseFloat(formValue(fd, "risk")) || 0,
        misc: parseFloat(formValue(fd, "misc")) || 0,
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">報價管理</h1>
          <p className="text-slate-500">多版本報價與內部成本分離管理</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "取消" : "新增報價"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>新增報價</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">商機</label>
                <Select name="pipelineId" required>
                  <option value="">選擇商機</option>
                  {pipelines.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">付款條件</label>
                <Input name="paymentTerms" placeholder="月結 30 天" />
              </div>
              <div>
                <label className="mb-1 block text-sm">項目名稱</label>
                <Input name="itemName" required />
              </div>
              <div>
                <label className="mb-1 block text-sm">單價</label>
                <Input name="unitPrice" type="number" required />
              </div>
              <div>
                <label className="mb-1 block text-sm">人天</label>
                <Input name="manDay" type="number" required />
              </div>
              <div className="md:col-span-2 border-t pt-4">
                <p className="mb-2 text-sm font-medium text-slate-600">內部成本（不對客戶顯示）</p>
                <div className="grid gap-4 md:grid-cols-4">
                  <Input name="labor" type="number" placeholder="人力成本" />
                  <Input name="travel" type="number" placeholder="差旅成本" />
                  <Input name="risk" type="number" placeholder="風險成本" />
                  <Input name="misc" type="number" placeholder="雜項成本" />
                </div>
              </div>
              <div className="md:col-span-2"><Button type="submit">建立報價</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <p>載入中...</p> : (
        <div className="grid gap-4">
          {quotations.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{q.pipeline?.customer?.name} - v{q.version}</h3>
                    <Badge>{QUOTATION_STATUS_LABELS[q.status]}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">{q.paymentTerms}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold">{formatCurrency(q.totalPrice)}</p>
                  {q.status === "SENT" && (
                    <Button size="sm" onClick={() => acceptMutation.mutate(q.id)}>標記成交</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
