"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { ROLE_LABELS } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function UsersPage() {
  const { data: users = [], isLoading } = useQuery({ queryKey: ["users"], queryFn: api.users });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">使用者管理</h1>
        <p className="text-slate-500">系統使用者與角色權限</p>
      </div>

      {isLoading ? <p>載入中...</p> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{u.name}</h3>
                  <Badge variant="blue">{ROLE_LABELS[u.role]}</Badge>
                </div>
                <p className="text-sm text-slate-500">{u.email}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
