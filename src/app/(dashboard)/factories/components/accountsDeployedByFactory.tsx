"use client";

import { LoadingText } from "@/components/charts/loading";
import ChartBlock from "@/components/charts/chartBlock";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import StackedBarChart from "@/components/charts/stackedBarChart";
import { FACTORY_CHART_CONFIG, RegistryEntityType } from "@/lib/registry";
import { TimeFrameResolutionType } from "@/lib/types";

interface AccountsByFactoryProps {
  selectedChains: number[];
  selectedFactories: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

// Accounts deployed by Factory.
export default function AccountsByFactoryChart({
  selectedChains,
  selectedFactories,
  startDate,
  endDate,
  resolution,
}: AccountsByFactoryProps) {
  // Accounts deployed by a given Factory.
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
        title="Accounts Deployed By Factory"
        description="Number of accounts deployed by a given factory."
      >
        {accountsByFactory.isFetching ? (
          <LoadingText />
        ) : (
          <div className="w-full">
            <StackedBarChart
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
