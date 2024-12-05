"use client";

import { LoadingText } from "@/components/charts/loading";
import ChartBlock from "@/components/charts/chartBlock";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import { BUNDLER_CHART_CONFIG, RegistryEntityType } from "@/lib/registry";
import StackedPercentChart from "@/components/charts/stackedAreaChart";
import { TimeFrameResolutionType } from "@/lib/types";

interface BundledUserOpsChartProps {
  selectedChains: number[];
  selectedBundlers: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

export default function BundledMarketshareChart({
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
      bundlers: selectedBundlers.map((b) => b.dbName),
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
        title="Bundled Marketshare"
        description="Percentage of user operations bundled by a given bundler."
      >
        {bundledUserOps.isFetching ? (
          <LoadingText />
        ) : (
          <div className="w-full">
            <StackedPercentChart
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
