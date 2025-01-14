"use client";
import FilterBar from "@/components/filter-bar";
import {
  ACCOUNT_FACTORIES,
  CHAIN_CHART_CONFIG,
  CHAINS,
  FACTORY_CHART_CONFIG,
} from "@/lib/registry";
import { useMemo, useState } from "react";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import { endOfDay, subDays } from "date-fns";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { UTCDate } from "@date-fns/utc";
import GlobalStatsOverview from "./components/globalStatsOverview";
import { api } from "@/trpc/react";
import UsageBarChart from "@/components/custom-components/usageGraph";
import MarketshareChart from "@/components/custom-components/marketshareGraph";

export default function OverviewPage() {
  const startTimeframe = "6mo";
  const startChains = CHAINS.filter((c) => !c.isTestnet).map((c) => c.chainId); // only mainnets
  const [selectedChains, setSelectedChains] = useState<number[]>(startChains);
  const [selectedTimeFrame, setSelectedTimeFrame] =
    useState<TimeFrameType>(startTimeframe);

  const { startDate, endDate, resolution } = useMemo(() => {
    const date = new UTCDate();
    const endDate = endOfDay(date);
    const startDate = endOfDay(
      subDays(date, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
    );

    let resolution: TimeFrameResolutionType = "day";
    if (selectedTimeFrame === "1d") {
      resolution = "hour";
    }

    return {
      startDate,
      endDate,
      resolution,
    };
  }, [selectedTimeFrame]);

  const bunldedOpsPerChain =
    api.globalStats.getTotalBundledOpsPerChain.useQuery(
      {
        startDate,
        endDate,
        resolution,
        chainIds: selectedChains,
      },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
      },
    );

  const dailyActiveAccounts = api.globalStats.getDailyActiveUsers.useQuery(
    {
      startDate,
      endDate,
      chainIds: selectedChains,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const deploymentsByFactory = api.factories.getDeploymentsByFactory.useQuery(
    {
      startDate,
      endDate,
      resolution,
      chainIds: selectedChains,
      factories: ACCOUNT_FACTORIES.map((e) => e.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  return (
    <div className="p-8 w-full flex flex-col gap-4">
      <h1 className="text-3xl font-bold mb-4">Global Stats</h1>
      <FilterBar
        setSelectedChains={setSelectedChains}
        selectedChains={selectedChains}
        setSelectedTimeFrame={setSelectedTimeFrame}
        selectedTimeFrame={selectedTimeFrame}
      />
      <GlobalStatsOverview
        selectedChains={selectedChains}
        startDate={startDate}
        endDate={endDate}
      />
      <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2">
        <UsageBarChart
          chartTitle={"User operations bundled"}
          chartDescription={"Number of user operations by chain."}
          chartConfig={CHAIN_CHART_CONFIG}
          data={bunldedOpsPerChain.data}
        />
        <MarketshareChart
          chartTitle={"Marketshare Of User Operations"}
          chartDescription={"Percentage of user operations by chain."}
          chartConfig={CHAIN_CHART_CONFIG}
          data={bunldedOpsPerChain.data}
        />
        <UsageBarChart
          chartTitle={"Daily unique accounts"}
          chartDescription={"Number of unique senders by chain per day."}
          chartConfig={CHAIN_CHART_CONFIG}
          data={dailyActiveAccounts.data}
        />
        <UsageBarChart
          data={deploymentsByFactory.data}
          chartConfig={FACTORY_CHART_CONFIG}
          chartTitle="Accounts deployed by factory"
          chartDescription="Number of accounts deployed by a given factory."
        />
      </div>
    </div>
  );
}
