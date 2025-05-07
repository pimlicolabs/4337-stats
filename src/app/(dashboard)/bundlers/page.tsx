"use client";
import FilterBar from "@/components/filter-bar";
import {
  CHAINS,
  BUNDLERS,
  RegistryEntityType,
  BUNDLER_CHART_CONFIG,
} from "@/lib/registry";
import { Suspense, useMemo } from "react";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import { endOfDay, subDays } from "date-fns";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { UTCDate } from "@date-fns/utc";
import GlobalStatsOverview from "./components/globalStatsOverview";
import UsageBarChart from "@/components/custom-components/usageGraph";
import MarketshareChart from "@/components/custom-components/marketshareGraph";
import UsageByChain from "@/components/custom-components/usageByChain";
import { api } from "@/trpc/react";
import { useQueryState } from "nuqs";

function BundlersContent() {
  const startTimeframe = "7d";
  const startChains = CHAINS.filter((c) => !c.isTestnet).map((c) => c.chainId); // only mainnets
  const startBundlers = BUNDLERS;

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

  const [selectedBundlers, setSelectedBundlers] = useQueryState(
    "bundlers",
    {
      defaultValue: startBundlers,
      parse: (value) => {
        if (!value) return startBundlers;
        try {
          const bundlerNames = value.split(',');
          return BUNDLERS.filter(bundler => 
            bundlerNames.includes(bundler.name)
          );
        } catch {
          return startBundlers;
        }
      },
      serialize: (value) => value.map(bundler => bundler.name).join(','),
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

  const opsBundledByPlatform = api.bundlers.opsByPlatformByDate.useQuery(
    {
      startDate,
      endDate,
      resolution,
      chainIds: selectedChains,
      bundlers: selectedBundlers.map((e) => e.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  //const dailyActiveUsers = api.factories.

  return (
    <div className="p-8 w-full flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Bundler Stats</h1>
      <FilterBar
        entityType="bundler"
        setSelectedChains={setSelectedChains}
        selectedChains={selectedChains}
        setSelectedEntitys={setSelectedBundlers}
        selectedEntitys={selectedBundlers}
        selectedTimeFrame={selectedTimeFrame}
        setSelectedTimeFrame={setSelectedTimeFrame}
      />
      <GlobalStatsOverview
        startDate={startDate}
        endDate={endDate}
        selectedChains={selectedChains}
        selectedTimeFrame={(selectedTimeFrame || startTimeframe) as TimeFrameType}
        selectedBundlers={selectedBundlers}
      />
      <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2">
        <UsageBarChart
          chartConfig={BUNDLER_CHART_CONFIG}
          chartTitle="Bundled User Operations"
          chartDescription="Number of user operations bundled by a bundler."
          data={opsBundledByPlatform.data}
        />
        <MarketshareChart
          chartTitle={"Bundled Marketshare"}
          chartDescription={
            "Percentage of user operations bundled by a given bundler."
          }
          data={opsBundledByPlatform.data}
          chartConfig={BUNDLER_CHART_CONFIG}
        />
      </div>
      <UsageByChain
        selectedChains={selectedChains}
        startDate={startDate}
        endDate={endDate}
        resolution={resolution}
        selectedEntity={selectedBundlers}
        entityType={"bundler"}
        chartDescription={"User operations bundled"}
      />
    </div>
  );
}

export default function BundlersPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <BundlersContent />
    </Suspense>
  );
}
