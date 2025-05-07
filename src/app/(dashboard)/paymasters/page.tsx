"use client";
import FilterBar from "@/components/filter-bar";
import {
  CHAINS,
  PAYMASTER_CHART_CONFIG,
  PAYMASTERS,
  RegistryEntityType,
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

function PaymastersContent() {
  const startTimeframe = "7d";
  const startChains = CHAINS.filter((c) => !c.isTestnet).map((c) => c.chainId); // only mainnets
  const startPaymasters = PAYMASTERS;

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

  const [selectedPaymasters, setSelectedPaymasters] = useQueryState(
    "paymasters",
    {
      defaultValue: startPaymasters,
      parse: (value) => {
        if (!value) return startPaymasters;
        try {
          const paymasterNames = value.split(',');
          return PAYMASTERS.filter(paymaster => 
            paymasterNames.includes(paymaster.name)
          );
        } catch {
          return startPaymasters;
        }
      },
      serialize: (value) => value.map(paymaster => paymaster.name).join(','),
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

  const sponsoredByPaymaster = api.paymasters.sponsoredByPaymaster.useQuery(
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
        selectedTimeFrame={(selectedTimeFrame || startTimeframe) as TimeFrameType}
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

export default function PaymastersPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <PaymastersContent />
    </Suspense>
  );
}
