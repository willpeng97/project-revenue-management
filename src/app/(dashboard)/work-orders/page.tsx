"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatDate, formValue } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function WorkOrdersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { data: workOrders = [], isLoading } = useQuery({ queryKey: ["work-orders"], queryFn: () => api.workOrders() });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: api.projects });
  const { data: customers = [] } = useQuery({ queryKey: ["customers"], queryFn: api.customers });

  const createMutation = useMutation({
    mutationFn: api.createWorkOrder,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["work-orders"] }); setShowForm(false); },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      projectId: formValue(fd, "projectId"),
      customerId: formValue(fd, "customerId"),
      serviceDate: formValue(fd, "serviceDate"),
      description: formValue(fd, "description"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">工作支援單</h1>
          <p className="text-slate-500">專案執行紀錄與客戶簽核</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "取消" : "新增工單"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>新增工作支援單</CardTitle></CardHeader>
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
                <label className="mb-1 block text-sm">客戶</label>
                <Select name="customerId" required>
                  <option value="">選擇客戶</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">服務日期</label>
                <Input name="serviceDate" type="date" required />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm">說明</label>
                <Input name="description" required />
              </div>
              <div className="md:col-span-2"><Button type="submit">建立</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <p>載入中...</p> : (
        <div className="grid gap-4">
          {workOrders.map((wo) => (
            <Card key={wo.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{wo.customer.name}</h3>
                      <Badge>{wo.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">{wo.description}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(wo.serviceDate)} · 工程師: {wo.engineer.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
