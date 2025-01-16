"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface StackedBarChartProps {
  data: Record<string, string | number>[];
  config: ChartConfig;
  xAxisKey: string;
  showLegend?: boolean;
  xAxisFormatter?: (value: string) => string;
  className?: string;
}

const defaultColor = "#94a3b8";

export default function StackedBarChart({
  data,
  config,
  xAxisKey,
  className,
  showLegend = true,
  xAxisFormatter = (value) => value.slice(0, 3),
}: StackedBarChartProps) {
  if (!data?.length || !config) {
    return (
      <div className="flex h-full items-center justify-center">
        No data available
      </div>
    );
  }

  return (
    <ChartContainer className={className} config={config}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={xAxisFormatter}
        />
        <YAxis
          tickMargin={10}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {Object.keys(config).map((key) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="a"
            fill={config[key]?.color || defaultColor}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
