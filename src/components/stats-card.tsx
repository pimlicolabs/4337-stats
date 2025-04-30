import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimeFrameType } from "@/lib/types";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: "positive" | "negative";
  trendValue?: string | number;
}

export const calculatePercentageChange = (
  current: number | null | undefined,
  previous: number | null | undefined,
): string => {
  if (!current || !previous) return "0";
  if (previous === 0) return "∞";
  return (((current - previous) / previous) * 100).toFixed(1);
};

export const getTrendDirection = (
  current: number | null | undefined,
  previous: number | null | undefined,
): "positive" | "negative" | undefined => {
  if (!current || !previous) return undefined;
  return current >= previous ? "positive" : "negative";
};

export const formatTrendDescription = (
  current: number | null | undefined,
  previous: number | null | undefined,
  selectedTimeFrame: TimeFrameType,
): string => {
  if (!current || !previous) return "Loading...";
  return `${(current - previous).toLocaleString()} difference from previous period`;
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground">
            {description}
            {trend && (
              <span
                className={`ml-1 ${trend === "positive" ? "text-green-600" : "text-red-600"}`}
              >
                {trend === "positive" ? "↑" : "↓"} {trendValue}
              </span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
