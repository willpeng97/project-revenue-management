"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard });

  if (isLoading) return <div className="text-slate-500">載入中...</div>;
  if (!data) return null;

  const revenueData = [
    { name: "收入", value: data.revenue.monthIncome },
    { name: "成本", value: data.revenue.monthCost },
    { name: "毛利", value: data.revenue.profit },
  ];

  const taskData = [
    { name: "待辦", value: data.task.todo },
    { name: "進行中", value: data.task.doing },
    { name: "延遲", value: data.task.delayed },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">營收儀表板</h1>
        <p className="text-slate-500">商機 → 報價 → 專案 → 收入 → 毛利</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="商機數" value={String(data.pipeline.count)} subtitle={`金額 ${formatCurrency(data.pipeline.amount)}`} />
        <StatCard title="預估收入" value={formatCurrency(data.pipeline.expectedRevenue)} subtitle={`成案率 ${data.pipeline.winRate}%`} />
        <StatCard title="本月毛利" value={formatCurrency(data.revenue.profit)} subtitle={`收入 ${formatCurrency(data.revenue.monthIncome)}`} />
        <StatCard title="本月轉撥" value={formatCurrency(data.transfer.monthTotal)} subtitle={`執行中專案 ${data.project.executing}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>營收分析</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}萬`} />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>任務狀態</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={taskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {taskData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="執行中專案" value={String(data.project.executing)} />
        <StatCard title="即將到期" value={String(data.project.upcoming)} />
        <StatCard title="已完成" value={String(data.project.completed)} />
      </div>

      {data.transfer.bySales.length > 0 && (
        <Card>
          <CardHeader><CardTitle>業務轉撥統計</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.transfer.bySales.map((item) => (
                <div key={item.name} className="flex justify-between rounded-lg bg-slate-50 px-4 py-2">
                  <span>{item.name}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
