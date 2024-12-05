"use client";

import { LoadingText } from "@/components/charts/loading";
import ChartBlock from "@/components/charts/chartBlock";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import { PAYMASTER_CHART_CONFIG, RegistryEntityType } from "@/lib/registry";
import StackedPercentChart from "@/components/charts/stackedAreaChart";
import { TimeFrameResolutionType } from "@/lib/types";

interface PaymasterUserOpsChartProps {
  selectedChains: number[];
  selectedPaymasters: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

export default function PaymasterMarketshareChart({
  selectedChains,
  selectedPaymasters,
  startDate,
  endDate,
  resolution,
}: PaymasterUserOpsChartProps) {
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
        title="Paymaster Marketshare"
        description="Percent of user operations sponsored by a given paymaster."
      >
        {sponsoredOps.isFetching ? (
          <LoadingText />
        ) : (
          <div className="w-full">
            <StackedPercentChart
              showLegend={false}
              data={data}
              config={PAYMASTER_CHART_CONFIG}
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
