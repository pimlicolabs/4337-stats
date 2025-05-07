"use client";

import { LoadingText } from "@/components/charts/loading";
import ChartBlock from "@/components/charts/chartBlock";
import StackedPercentChart from "@/components/charts/stackedAreaChart";
import { ChartConfig } from "../ui/chart";

interface MarketshareChartProps {
  chartTitle: string;
  chartDescription: string;
  chartConfig: ChartConfig;
  data: Record<string, number>[] | undefined;
}

export default function MarketshareChart({
  chartTitle,
  chartDescription,
  chartConfig,
  data,
}: MarketshareChartProps) {
  return (
    <>
      <ChartBlock title={chartTitle} description={chartDescription}>
        {data ? (
          <div className="w-full">
            <StackedPercentChart
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
