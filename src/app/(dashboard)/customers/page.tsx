"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formValue, formValueOptional } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CustomersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { data: customers = [], isLoading } = useQuery({ queryKey: ["customers"], queryFn: api.customers });

  const createMutation = useMutation({
    mutationFn: api.createCustomer,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["customers"] }); setShowForm(false); },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formValue(fd, "name"),
      taxId: formValueOptional(fd, "taxId"),
      contact: formValueOptional(fd, "contact"),
      phone: formValueOptional(fd, "phone"),
      email: formValueOptional(fd, "email"),
      address: formValueOptional(fd, "address"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">客戶管理</h1>
          <p className="text-slate-500">客戶資料維護</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "取消" : "新增客戶"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>新增客戶</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div><label className="mb-1 block text-sm">公司名稱</label><Input name="name" required /></div>
              <div><label className="mb-1 block text-sm">統編</label><Input name="taxId" /></div>
              <div><label className="mb-1 block text-sm">聯絡人</label><Input name="contact" /></div>
              <div><label className="mb-1 block text-sm">電話</label><Input name="phone" /></div>
              <div><label className="mb-1 block text-sm">Email</label><Input name="email" type="email" /></div>
              <div><label className="mb-1 block text-sm">地址</label><Input name="address" /></div>
              <div className="md:col-span-2"><Button type="submit">建立</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <p>載入中...</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {customers.map((c) => (
            <Card key={c.id}>
              <CardContent className="py-4">
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-slate-500">統編: {c.taxId || "-"}</p>
                <p className="text-sm text-slate-500">{c.contact} · {c.phone}</p>
                <p className="text-sm text-slate-500">{c.email}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
