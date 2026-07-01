"use client";

import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCompact } from "@/lib/analytics/selectors";
import { formatCurrency } from "@/lib/utils";

export interface TrendSeries {
  key: string;
  name: string;
  color: string;
}

export function TrendChart({
  data,
  series,
  variant = "area",
  height = 280,
  valueFormatter,
  axisFormatter,
}: {
  data: Record<string, string | number>[];
  series: TrendSeries[];
  variant?: "area" | "line";
  height?: number;
  valueFormatter?: (v: number) => string;
  axisFormatter?: (v: number) => string;
}) {
  const fmtValue = valueFormatter ?? ((v: number) => formatCurrency(v));
  const fmtAxis = axisFormatter ?? ((v: number) => formatCompact(v));
  const tooltipStyle = {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    fontSize: 12,
    boxShadow: "0 4px 12px rgb(15 23 42 / 0.08)",
  };
  const axis = { tickLine: false, axisLine: false, tick: { fontSize: 12, fill: "#94a3b8" } } as const;

  return (
    <ResponsiveContainer width="100%" height={height}>
      {variant === "area" ? (
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
          <XAxis dataKey="label" {...axis} />
          <YAxis width={48} {...axis} tickFormatter={(v) => fmtAxis(Number(v))} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtValue(Number(v))} />
          {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              fill={`url(#grad-${s.key})`}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </AreaChart>
      ) : (
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
          <XAxis dataKey="label" {...axis} />
          <YAxis width={48} {...axis} tickFormatter={(v) => fmtAxis(Number(v))} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmtValue(Number(v))} />
          {series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}
