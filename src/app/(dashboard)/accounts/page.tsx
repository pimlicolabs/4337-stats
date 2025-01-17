"use client";

import FilterBar from "@/components/filter-bar";
import {
  CHAINS,
  ACCOUNT_FACTORIES,
  RegistryEntityType,
  FACTORY_CHART_CONFIG,
} from "@/lib/registry";
import { useMemo, useState } from "react";
import { endOfDay, subDays } from "date-fns";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { UTCDate } from "@date-fns/utc";
import GlobalStatsOverview from "./components/globalStatsOverview";
import UsageBarChart from "@/components/custom-components/usageGraph";
import MarketshareChart from "@/components/custom-components/marketshareGraph";
import UsageByChain from "@/components/custom-components/usageByChain";
import { api } from "@/trpc/react";

export default function BundlersPage() {
  const startTimeframe = "7d";
  const startChains = CHAINS.filter((c) => !c.isTestnet).map((c) => c.chainId); // only mainnets
  const startFactories = ACCOUNT_FACTORIES;

  const [selectedChains, setSelectedChains] = useState<number[]>(startChains);
  const [selectFactories, setSelectFactories] =
    useState<RegistryEntityType[]>(startFactories);
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

  const deploymentsByFactory = api.accounts.deploymentsByFactory.useQuery(
    {
      startDate,
      endDate,
      resolution,
      chainIds: selectedChains,
      factories: selectFactories.map((e) => e.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const activeUsersByFactory =
    api.accounts.uniqueSendersByFactoryByDay.useQuery(
      {
        startDate,
        endDate,
        chainIds: selectedChains,
        factories: selectFactories.map((e) => e.dbName),
      },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
      },
    );

  return (
    <div className="p-8 w-full flex flex-col gap-4">
      <h1 className="text-3xl font-bold mb-4">Account Factory Stats</h1>
      <FilterBar
        entityType="account_factory"
        setSelectedChains={setSelectedChains}
        selectedChains={selectedChains}
        setSelectedEntitys={setSelectFactories}
        selectedEntitys={selectFactories}
        selectedTimeFrame={selectedTimeFrame}
        setSelectedTimeFrame={setSelectedTimeFrame}
      />
      <GlobalStatsOverview
        startDate={startDate}
        endDate={endDate}
        selectedChains={selectedChains}
        selectedFactories={selectFactories}
      />
      <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2">
        <UsageBarChart
          data={deploymentsByFactory.data}
          chartConfig={FACTORY_CHART_CONFIG}
          chartTitle="Accounts deployed by factory"
          chartDescription="Number of accounts deployed by a given factory."
        />
        <MarketshareChart
          chartTitle={"Marketshare of accounts deployed by factory"}
          chartDescription={
            "Percentage of accounts deployed by a given factory."
          }
          chartConfig={FACTORY_CHART_CONFIG}
          data={deploymentsByFactory.data}
        />
      </div>
      <UsageBarChart
        className="w-full h-64"
        data={activeUsersByFactory.data}
        chartConfig={FACTORY_CHART_CONFIG}
        chartTitle="Daily active users"
        chartDescription="Unique senders by smart account type (where senders are older than 1 day)"
      />
      <UsageByChain
        selectedChains={selectedChains}
        startDate={startDate}
        endDate={endDate}
        resolution={resolution}
        selectedEntity={selectFactories}
        entityType={"account_factory"}
        chartDescription={"Accounts deployed"}
      />
    </div>
  );
}
