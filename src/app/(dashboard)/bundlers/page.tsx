"use client";
import FilterBar from "@/components/filter-bar";
import { CHAINS, BUNDLERS } from "@/lib/registry";
import { useMemo, useState } from "react";
import BundledUserOpsChart from "./components/opsBundledChart";
import BundledMarketshareChart from "./components/opsMarketshareChart";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import { endOfDay, subDays } from "date-fns";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { UTCDate } from "@date-fns/utc";
import BundlerUsageByChain from "./components/bundlerUsageByChain";
import GlobalStatsOverview from "./components/globalStatsOverview";

export default function BundlersPage() {
  const startTimeframe = "7d";
  const startChains = CHAINS.filter((c) => !c.isTestnet).map((c) => c.chainId); // only mainnets
  const startBundlers = BUNDLERS.map((b) => b.name);

  const [selectedChains, setSelectedChains] = useState<number[]>(startChains);
  const [selectedBundlers, setSelectedBundlers] =
    useState<string[]>(startBundlers);
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
        selectedBundlers={selectedBundlers.map((bundler) =>
          bundler.toLowerCase(),
        )}
      />
      <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2">
        <BundledUserOpsChart
          startDate={startDate}
          endDate={endDate}
          resolution={resolution}
          selectedChains={selectedChains}
          selectedBundlers={selectedBundlers.map((bundler) =>
            bundler.toLowerCase(),
          )}
        />
        <BundledMarketshareChart
          startDate={startDate}
          endDate={endDate}
          resolution={resolution}
          selectedChains={selectedChains}
          selectedBundlers={selectedBundlers.map((bundler) =>
            bundler.toLowerCase(),
          )}
        />
      </div>
      <BundlerUsageByChain
        selectedChains={selectedChains}
        startDate={startDate}
        endDate={endDate}
        resolution={resolution}
        selectedBundlers={selectedBundlers.map((bundler) =>
          bundler.toLowerCase(),
        )}
      />
    </div>
  );
}
