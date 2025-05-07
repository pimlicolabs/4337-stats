"use client";

import FilterBar from "@/components/filter-bar";
import {
  CHAINS,
  ACCOUNT_FACTORIES,
  RegistryEntityType,
  FACTORY_CHART_CONFIG,
} from "@/lib/registry";
import { useMemo } from "react";
import { endOfDay, subDays } from "date-fns";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { UTCDate } from "@date-fns/utc";
import GlobalStatsOverview from "./components/globalStatsOverview";
import UsageBarChart from "@/components/custom-components/usageGraph";
import MarketshareChart from "@/components/custom-components/marketshareGraph";
import UsageByChain from "@/components/custom-components/usageByChain";
import { api } from "@/trpc/react";
import { useQueryState } from "nuqs";

export default function AccountsPage() {
  const startTimeframe = "7d";
  const startChains = CHAINS.filter((c) => !c.isTestnet).map((c) => c.chainId); // only mainnets
  const startFactories = ACCOUNT_FACTORIES;

  const [selectedChains, setSelectedChains] = useQueryState(
    "chains",
    {
      defaultValue: startChains,
      parse: (value) => {
        if (!value) return startChains;
        try {
          return value.split(',').map(Number).filter(n => !isNaN(n));
        } catch {
          return startChains;
        }
      },
      serialize: (value) => value.join(','),
    }
  );

  const [selectFactories, setSelectFactories] = useQueryState(
    "factories",
    {
      defaultValue: startFactories,
      parse: (value) => {
        if (!value) return startFactories;
        try {
          const factoryNames = value.split(',');
          return ACCOUNT_FACTORIES.filter(factory => 
            factoryNames.includes(factory.name)
          );
        } catch {
          return startFactories;
        }
      },
      serialize: (value) => value.map(factory => factory.name).join(','),
    }
  );

  const [selectedTimeFrame, setSelectedTimeFrame] = useQueryState(
    "timeframe",
    {
      defaultValue: startTimeframe,
      parse: (value) => {
        // Check if the value is a valid TimeFrameType
        const validTimeFrames = ["1d", "7d", "14d", "30d", "6mo"] as const;
        return validTimeFrames.includes(value as any) 
          ? (value as TimeFrameType) 
          : startTimeframe;
      },
      serialize: (value) => value,
    }
  );

  const { startDate, endDate, resolution } = useMemo(() => {
    const date = new UTCDate();
    const endDate = endOfDay(date);
    const timeFrame = selectedTimeFrame || startTimeframe;
    const startDate = endOfDay(
      subDays(date, TIME_PERIOD_TO_DAYS[timeFrame as keyof typeof TIME_PERIOD_TO_DAYS]),
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
        selectedTimeFrame={(selectedTimeFrame || startTimeframe) as TimeFrameType}
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
