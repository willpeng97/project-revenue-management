"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { formValue, formValueOptional } from "@/lib/utils";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const COLUMNS = ["TODO", "DOING", "REVIEW", "DONE"] as const;

export default function TasksPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ["tasks"], queryFn: () => api.tasks() });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: api.projects });

  const createMutation = useMutation({
    mutationFn: api.createTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.updateTask(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      projectId: formValue(fd, "projectId"),
      title: formValue(fd, "title"),
      priority: formValue(fd, "priority"),
      dueDate: formValueOptional(fd, "dueDate"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">任務看板</h1>
          <p className="text-slate-500">Kanban 任務管理</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? "取消" : "新增任務"}</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>新增任務</CardTitle></CardHeader>
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
                <label className="mb-1 block text-sm">標題</label>
                <Input name="title" required />
              </div>
              <div>
                <label className="mb-1 block text-sm">優先度</label>
                <Select name="priority">
                  {Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm">到期日</label>
                <Input name="dueDate" type="date" />
              </div>
              <div className="md:col-span-2"><Button type="submit">建立</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? <p>載入中...</p> : (
        <div className="grid gap-4 md:grid-cols-4">
          {COLUMNS.map((col) => (
            <Card key={col}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">{TASK_STATUS_LABELS[col]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tasks.filter((t) => t.status === col).map((task) => (
                  <div key={task.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="yellow">{TASK_PRIORITY_LABELS[task.priority]}</Badge>
                      {col !== "DONE" && (
                        <button
                          className="text-xs text-blue-600 hover:underline"
                          onClick={() => {
                            const next = COLUMNS[COLUMNS.indexOf(col) + 1];
                            if (next) updateMutation.mutate({ id: task.id, status: next });
                          }}
                        >
                          推進 →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
