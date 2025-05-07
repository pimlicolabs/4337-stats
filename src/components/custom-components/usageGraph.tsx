"use client";

import { LoadingText } from "@/components/charts/loading";
import ChartBlock from "@/components/charts/chartBlock";
import StackedBarChart from "@/components/charts/stackedBarChart";
import { ChartConfig } from "../ui/chart";

interface UsageByEntityChartProps {
  chartConfig: ChartConfig;
  chartTitle: string;
  chartDescription: string;
  data: Record<string, number>[] | undefined;
  className?: string;
}

export default function UsageBarChart({
  data,
  chartConfig,
  chartTitle,
  chartDescription,
  className,
}: UsageByEntityChartProps) {
  return (
    <>
      <ChartBlock title={chartTitle} description={chartDescription}>
        {data ? (
          <div className="w-full">
            <StackedBarChart
              className={className}
              showLegend={false}
              data={data}
              config={chartConfig}
              xAxisKey="date"
              xAxisFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short"
                }).replace(' ', ' ');
              }}
            />
          </div>
        ) : (
          <LoadingText />
        )}
      </ChartBlock>
    </>
  );
}
