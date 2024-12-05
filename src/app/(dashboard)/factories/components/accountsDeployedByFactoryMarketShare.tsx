"use client";

import { LoadingText } from "@/components/charts/loading";
import ChartBlock from "@/components/charts/chartBlock";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import { FACTORY_CHART_CONFIG, RegistryEntityType } from "@/lib/registry";
import StackedPercentChart from "@/components/charts/stackedAreaChart";
import { TimeFrameResolutionType } from "@/lib/types";

interface FactoryMarketshareProps {
  selectedChains: number[];
  selectedFactories: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

export default function FactoryMarketShare({
  selectedChains,
  selectedFactories,
  startDate,
  endDate,
  resolution,
}: FactoryMarketshareProps) {
  const accountsByFactory = api.factories.getDeploymentCount.useQuery(
    {
      startDate,
      endDate,
      resolution,
      chainIds: selectedChains,
      factories: selectedFactories.map((f) => f.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const data = useMemo(() => {
    return accountsByFactory.data || [];
  }, [accountsByFactory.data]);

  return (
    <>
      <ChartBlock
        title="Marketshare Of Accounts Deployed By Factory"
        description="Percentage of accounts deployed by a given factory."
      >
        {accountsByFactory.isFetching ? (
          <LoadingText />
        ) : (
          <div className="w-full">
            <StackedPercentChart
              showLegend={false}
              data={data}
              config={FACTORY_CHART_CONFIG}
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
