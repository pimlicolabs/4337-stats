"use client";
import FilterBar from "@/components/filter-bar";
import { CHAINS, BUNDLERS, RegistryEntityType } from "@/lib/registry";
import { useMemo, useState } from "react";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import { endOfDay, subDays } from "date-fns";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { UTCDate } from "@date-fns/utc";
import BundlerUsageByChain from "./components/bundlerUsageByChain";
import GlobalStatsOverview from "./components/globalStatsOverview";
import UsageByEntityChart from "@/components/entity-graphs/usageGraph";
import MarketshareChart from "@/components/entity-graphs/marketshareGraph";
import UsageByChain from "@/components/entity-graphs/usageByChain";

export default function BundlersPage() {
  const startTimeframe = "7d";
  const startChains = CHAINS.filter((c) => !c.isTestnet).map((c) => c.chainId); // only mainnets
  const startBundlers = BUNDLERS;

  const [selectedChains, setSelectedChains] = useState<number[]>(startChains);
  const [selectedBundlers, setSelectedBundlers] =
    useState<RegistryEntityType[]>(startBundlers);
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
        selectedTimeFrame={selectedTimeFrame}
        selectedBundlers={selectedBundlers}
      />
      <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2">
        <UsageByEntityChart
          entityType="bundler"
          chartTitle="Bundled User Operations"
          chartDescription="Number of user operations bundled by a bundler."
          startDate={startDate}
          endDate={endDate}
          resolution={resolution}
          selectedChains={selectedChains}
          selectedEntity={selectedBundlers}
        />
        <MarketshareChart
          chartTitle={"Bundled Marketshare"}
          chartDescription={
            "Percentage of user operations bundled by a given bundler."
          }
          entityType={"bundler"}
          selectedChains={selectedChains}
          selectedEntity={selectedBundlers}
          startDate={startDate}
          endDate={endDate}
          resolution={resolution}
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
