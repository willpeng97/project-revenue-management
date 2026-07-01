import { Badge } from "@/components/ui/badge";
import type { ProjectStatus, ProjectHealth } from "@/lib/analytics/mock-data";

const STATUS: Record<ProjectStatus, { label: string; variant: "default" | "blue" | "green" | "yellow" | "red" }> = {
  PLANNING: { label: "規劃中", variant: "default" },
  EXECUTING: { label: "執行中", variant: "blue" },
  ACCEPTANCE: { label: "驗收中", variant: "yellow" },
  CLOSED: { label: "已結案", variant: "green" },
};

const HEALTH: Record<ProjectHealth, { label: string; variant: "green" | "yellow" | "red" }> = {
  normal: { label: "正常", variant: "green" },
  risk: { label: "風險", variant: "yellow" },
  delayed: { label: "延遲", variant: "red" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = STATUS[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function HealthBadge({ health }: { health: ProjectHealth }) {
  const h = HEALTH[health];
  return <Badge variant={h.variant}>{h.label}</Badge>;
}
