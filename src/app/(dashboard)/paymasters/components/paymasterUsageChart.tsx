"use client";

import { LoadingText } from "@/components/charts/loading";
import ChartBlock from "@/components/charts/chartBlock";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import StackedBarChart from "@/components/charts/stackedBarChart";
import { PAYMASTER_CHART_CONFIG, RegistryEntityType } from "@/lib/registry";
import { TimeFrameResolutionType } from "@/lib/types";

interface PaymasterUsageProps {
  selectedChains: number[];
  selectedPaymasters: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

export default function PaymasterUsageChart({
  selectedChains,
  selectedPaymasters,
  startDate,
  endDate,
  resolution,
}: PaymasterUsageProps) {
  const sponsoredOps = api.paymasters.getSponsoredOpsCount.useQuery(
    {
      startDate,
      endDate,
      resolution,
      chainIds: selectedChains,
      paymasters: selectedPaymasters.map((p) => p.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const data = useMemo(() => {
    return sponsoredOps.data || [];
  }, [sponsoredOps.data]);

  return (
    <>
      <ChartBlock
        title="Paymaster Usage"
        description="Number of sponsored user operations by a given paymaster."
      >
        {sponsoredOps.isFetching ? (
          <LoadingText />
        ) : (
          <div className="w-full">
            <StackedBarChart
              showLegend={false}
              data={data}
              config={PAYMASTER_CHART_CONFIG}
              xAxisKey="date"
              xAxisFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  timeZone: "UTC",
                });
              }}
            />
          </div>
        )}
      </ChartBlock>
    </>
  );
}
