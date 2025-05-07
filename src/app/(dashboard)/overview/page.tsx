"use client";
import FilterBar from "@/components/filter-bar";
import {
  ACCOUNT_FACTORIES,
  CHAIN_CHART_CONFIG,
  CHAINS,
  FACTORY_CHART_CONFIG,
} from "@/lib/registry";
import { Suspense, useMemo } from "react";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import { endOfDay, subDays } from "date-fns";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { UTCDate } from "@date-fns/utc";
import GlobalStatsOverview from "./components/globalStatsOverview";
import { api } from "@/trpc/react";
import UsageBarChart from "@/components/custom-components/usageGraph";
import MarketshareChart from "@/components/custom-components/marketshareGraph";
import { useQueryState } from "nuqs";

function OverviewContent() {
  const startTimeframe = "6mo";
  const startChains = CHAINS.filter((c) => !c.isTestnet).map((c) => c.chainId); // only mainnets
  
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

  const bunldedOpsPerChain = api.bundlers.totalOpsByChain.useQuery(
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

  const deploymentsByFactory = api.accounts.deploymentsByFactory.useQuery(
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
        selectedTimeFrame={(selectedTimeFrame || startTimeframe) as TimeFrameType}
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
          data={deploymentsByFactory.data}
          chartConfig={FACTORY_CHART_CONFIG}
          chartTitle="Accounts deployed by factory"
          chartDescription="Number of accounts deployed by a given factory."
        />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <OverviewContent />
    </Suspense>
  );
}
