"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formValue, formValueOptional, formatCurrency } from "@/lib/utils";
import { PIPELINE_STATUS_LABELS, PIPELINE_TYPE_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function PipelinesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { data: pipelines = [], isLoading } = useQuery({ queryKey: ["pipelines"], queryFn: api.pipelines });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: api.customers });

  const createMutation = useMutation({
    mutationFn: api.createPipeline,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pipelines"] });
      setShowForm(false);
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      customerId: formValue(fd, "customerId"),
      title: formValue(fd, "title"),
      type: formValue(fd, "type"),
      cost: formValue(fd, "cost"),
      successRate: formValue(fd, "successRate"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">商機 Pipeline</h1>
          <p className="text-slate-500">管理商機與預估營收</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "取消" : "新增商機"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>新增商機</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">客戶</label>
                <Select name="customerId" required>
                  <option value="">選擇客戶</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">專案名稱</label>
                <Input name="title" required />
              </div>
              <div>
                <label className="mb-1 block text-sm">類型</label>
                <Select name="type">
                  {Object.entries(PIPELINE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">金額</label>
                <Input name="cost" type="number" required />
              </div>
              <div>
                <label className="mb-1 block text-sm">成功率 (%)</label>
                <Input name="successRate" type="number" defaultValue={50} min={0} max={100} />
              </div>
              <div className="md:col-span-2">
                <Button type="submit">建立</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-slate-500">載入中...</p>
      ) : (
        <div className="grid gap-4">
          {pipelines.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{p.title}</h3>
                    <Badge variant="blue">{PIPELINE_STATUS_LABELS[p.status]}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">{p.customer.name} · {PIPELINE_TYPE_LABELS[p.type]}</p>
                  <p className="text-sm text-slate-500">負責人: {p.owner.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(p.cost)}</p>
                  <p className="text-sm text-green-600">預估 {formatCurrency(p.expectedRevenue)}</p>
                  <p className="text-xs text-slate-400">成功率 {p.successRate}%</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
