"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface StackedAreaChartProps {
  data: Record<string, string | number>[];
  config: ChartConfig;
  xAxisKey: string;
  showLegend?: boolean;
  xAxisFormatter?: (value: string) => string;
}

const defaultColor = "#94a3b8";

export default function StackedAreaChart({
  data,
  config,
  xAxisKey,
  showLegend = true,
  xAxisFormatter = (value) => {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      }).replace(' ', ' ');
    } catch (e) {
      return value.slice(0, 3);
    }
  },
}: StackedAreaChartProps) {
  if (!data?.length || !config) {
    return (
      <div className="flex h-full items-center justify-center">
        No data available
      </div>
    );
  }

  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string, entry: any) => {
    const color = config[name]?.color || defaultColor;
    const label = config[name]?.label || name;
    const percentage = (value || 0).toFixed(1);

    return [
      <span key={name} style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            backgroundColor: color,
            marginRight: "5px",
          }}
        ></span>
        <span
          style={{
            display: "inline-block",
            width: "150px",
            textAlign: "left",
          }}
        >
          {label}
        </span>
        <span>{percentage}%</span>
      </span>,
      "",
    ];
  };

  // Calculate averages and filter out empty series
  const seriesAverages = Object.keys(config).reduce(
    (acc, key) => {
      const sum = data.reduce(
        (total, item) => total + (Number(item[key]) || 0),
        0,
      );
      const hasAnyValue = data.some((item) => Number(item[key]) > 0);
      if (hasAnyValue) {
        acc[key] = sum / data.length;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  // Sort keys by average value (descending)
  const sortedKeys = Object.keys(seriesAverages).sort(
    (a, b) => seriesAverages[b]! - seriesAverages[a]!,
  );

  // Transform data to percentages using only non-empty series
  const transformedData = data.map((item) => {
    const total = sortedKeys.reduce(
      (sum, key) => sum + (Number(item[key]) || 0),
      0,
    );
    const percentages = { ...item };

    sortedKeys.forEach((key) => {
      percentages[key] = total > 0 ? (Number(item[key]) / total) * 100 : 0;
    });

    return percentages;
  });

  return (
    <ChartContainer config={config}>
      <AreaChart
        data={transformedData}
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
          domain={[0, 100]}
          tickFormatter={(value) => {
            // For percentages, we just round to the nearest integer
            return `${Math.round(value)}%`;
          }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
          formatter={tooltipFormatter}
        />
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {sortedKeys.map((key) => (
          <Area
            isAnimationActive={false}
            key={key}
            dataKey={key}
            stackId="a"
            fill={config[key]?.color || defaultColor}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
