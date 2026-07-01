"use client";

import { AnalyticsHeader } from "./analytics-header";
import { AnalyticsFilterBar } from "./analytics-filter-bar";

export function AnalyticsPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5" style={{ animation: "var(--animate-fade-in-up)" }}>
      <AnalyticsHeader title={title} subtitle={subtitle} />
      <AnalyticsFilterBar />
      <div className="space-y-4">{children}</div>
    </div>
  );
}
