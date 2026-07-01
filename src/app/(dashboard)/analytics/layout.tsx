import { AnalyticsFilterProvider } from "@/lib/analytics/filter-context";

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <AnalyticsFilterProvider>{children}</AnalyticsFilterProvider>;
}
