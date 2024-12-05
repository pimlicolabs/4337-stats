"use client";

import FilterBar from "@/components/filter-bar";
import { CHAINS, ACCOUNT_FACTORIES, RegistryEntityType } from "@/lib/registry";
import { useMemo, useState } from "react";
import AccountsDeployedByFactory from "./components/accountsDeployedByFactory";
import { endOfDay, subDays } from "date-fns";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { UTCDate } from "@date-fns/utc";
import FactoryMarketShare from "./components/accountsDeployedByFactoryMarketShare";
import GlobalStatsOverview from "./components/globalStatsOverview";
import FactoryUsageByChain from "./components/factoryUsageByChain";

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
        <AccountsDeployedByFactory
          startDate={startDate}
          endDate={endDate}
          resolution={resolution}
          selectedChains={selectedChains}
          selectedFactories={selectFactories}
        />
        <FactoryMarketShare
          startDate={startDate}
          endDate={endDate}
          resolution={resolution}
          selectedChains={selectedChains}
          selectedFactories={selectFactories}
        />
      </div>
      <FactoryUsageByChain
        selectedChains={selectedChains}
        startDate={startDate}
        endDate={endDate}
        resolution={resolution}
        selectedFactories={selectFactories}
      />
    </div>
  );
}
