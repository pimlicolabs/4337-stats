"use client";
import FilterBar from "@/components/filter-bar";
import {
  CHAINS,
  PAYMASTER_CHART_CONFIG,
  PAYMASTERS,
  RegistryEntityType,
} from "@/lib/registry";
import { useMemo, useState } from "react";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import { endOfDay, subDays } from "date-fns";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { UTCDate } from "@date-fns/utc";
import GlobalStatsOverview from "./components/globalStatsOverview";
import UsageBarChart from "@/components/entity-graphs/usageGraph";
import MarketshareChart from "@/components/entity-graphs/marketshareGraph";
import UsageByChain from "@/components/entity-graphs/usageByChain";
import { api } from "@/trpc/react";

export default function PaymastersPage() {
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

  const sponsoredByPaymaster = api.paymasters.getSponsoredByPaymaster.useQuery(
    {
      startDate,
      endDate,
      resolution,
      chainIds: selectedChains,
      paymasters: selectedPaymasters.map((e) => e.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

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
        <UsageBarChart
          chartConfig={PAYMASTER_CHART_CONFIG}
          chartTitle="Paymaster Usage"
          chartDescription="Number of sponsored user operations by a given paymaster."
          data={sponsoredByPaymaster.data}
        />
        <MarketshareChart
          chartTitle={"Paymaster Marketshare"}
          chartDescription={
            "Percent of user operations sponsored by a given paymaster."
          }
          data={sponsoredByPaymaster.data}
          chartConfig={PAYMASTER_CHART_CONFIG}
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
