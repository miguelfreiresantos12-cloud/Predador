"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
}

export function MetricCard({ title, value, trend, trendUp }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      <div className="mt-2 flex items-end justify-between">
        <span className="text-2xl font-semibold">{value}</span>
        <span className={`flex items-center gap-0.5 text-xs font-medium ${trendUp ? "text-positive" : "text-destructive"}`}>
          {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend}
        </span>
      </div>
    </div>
  );
}
