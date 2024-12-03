"use client";

import { LoadingText } from "@/components/charts/loading";
import ChartBlock from "@/components/charts/chartBlock";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import StackedBarChart from "@/components/charts/stackedBarChart";
import { BUNDLER_CHART_CONFIG } from "@/lib/registry";
import { TimeFrameResolutionType } from "@/lib/types";

interface BundledUserOpsChartProps {
  selectedChains: number[];
  selectedBundlers: string[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

export default function BundledUserOpsChart({
  selectedChains,
  selectedBundlers,
  startDate,
  endDate,
  resolution,
}: BundledUserOpsChartProps) {
  const bundledUserOps = api.bundlers.getBundledOpsCount.useQuery(
    {
      startDate,
      endDate,
      resolution,
      chainIds: selectedChains,
      bundlers: selectedBundlers,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const data = useMemo(() => {
    return bundledUserOps.data || [];
  }, [bundledUserOps.data]);

  return (
    <>
      <ChartBlock
        title="Bundled User Operations"
        description="Number of user operations bundled by a given bundler."
      >
        {bundledUserOps.isFetching ? (
          <LoadingText />
        ) : (
          <div className="w-full">
            <StackedBarChart
              showLegend={false}
              data={data}
              config={BUNDLER_CHART_CONFIG}
              xAxisKey="date"
              xAxisFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                });
              }}
            />
          </div>
        )}
      </ChartBlock>
    </>
  );
}
