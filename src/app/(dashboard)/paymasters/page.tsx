"use client";
import FilterBar from "@/components/filter-bar";
import { CHAINS, PAYMASTERS, RegistryEntityType } from "@/lib/registry";
import { useMemo, useState } from "react";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import { endOfDay, subDays } from "date-fns";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { UTCDate } from "@date-fns/utc";
import PaymasterUsageByChain from "./components/paymasterUsageByChain";
import GlobalStatsOverview from "./components/globalStatsOverview";
import UsageByEntityChart from "@/components/entity-graphs/usageGraph";
import MarketshareChart from "@/components/entity-graphs/marketshareGraph";
import UsageByChain from "@/components/entity-graphs/usageByChain";

export default function BundlersPage() {
  const startTimeframe = "7d";
  const startChains = CHAINS.filter((c) => !c.isTestnet).map((c) => c.chainId); // only mainnets
  const startPaymasters = PAYMASTERS;

  const [selectedChains, setSelectedChains] = useState<number[]>(startChains);
  const [selectedPaymasters, setSelectedPaymasters] =
    useState<RegistryEntityType[]>(startPaymasters);
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
      <h1 className="text-3xl font-bold mb-4">Paymaster Stats</h1>
      <FilterBar
        entityType="paymaster"
        setSelectedChains={setSelectedChains}
        selectedChains={selectedChains}
        setSelectedEntitys={setSelectedPaymasters}
        selectedEntitys={selectedPaymasters}
        selectedTimeFrame={selectedTimeFrame}
        setSelectedTimeFrame={setSelectedTimeFrame}
      />
      <GlobalStatsOverview
        startDate={startDate}
        endDate={endDate}
        selectedChains={selectedChains}
        selectedPaymasters={selectedPaymasters}
      />
      <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2">
        <UsageByEntityChart
          entityType="paymaster"
          chartTitle="Paymaster Usage"
          chartDescription="Number of sponsored user operations by a given paymaster."
          startDate={startDate}
          endDate={endDate}
          resolution={resolution}
          selectedChains={selectedChains}
          selectedEntity={selectedPaymasters}
        />
        <MarketshareChart
          chartTitle={"Paymaster Marketshare"}
          chartDescription={
            "Percent of user operations sponsored by a given paymaster."
          }
          entityType={"paymaster"}
          selectedChains={selectedChains}
          selectedEntity={selectedPaymasters}
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
        selectedEntity={selectedPaymasters}
        entityType={"paymaster"}
        chartDescription={"User operations sponsored"}
      />
    </div>
  );
}
