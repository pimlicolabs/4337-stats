"use client";

import { useParams } from "next/navigation";
import {
  ACCOUNT_FACTORIES,
  BUNDLERS,
  CHAIN_CHART_CONFIG,
  CHAINS,
  FACTORY_CHART_CONFIG,
  PAYMASTERS,
} from "@/lib/registry";
import { api } from "@/trpc/react";
import { useMemo, useState } from "react";
import { UTCDate } from "@date-fns/utc";
import { endOfDay, subDays } from "date-fns";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import UsageBarChart from "@/components/custom-components/usageGraph";
import TimefilterDropdown from "./components/timeFilterDropdown";
import ChainDropdown from "./components/chainDropdown";
import { StatsHeader } from "./components/StatsHeader";
import { UsageTable } from "@/components/custom-components/usageTable";

export default function ChainStats() {
  const params = useParams();
  const chain = CHAINS.find((c) => c.slugName === params.slug);
  if (!chain) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-2xl font-semibold">404 Not Found</div>
      </div>
    );
  }

  const startTimeframe = "7d";
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

  const opsByPlatform = api.bundlers.opsByPlatformForChain.useQuery(
    {
      startDate,
      endDate,
      chainId: chain.chainId,
      bundlers: BUNDLERS.map((e) => e.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const sponsoredOpsByPlatform =
    api.paymasters.sponsoredByPlatformForChain.useQuery(
      {
        startDate,
        endDate,
        chainId: chain.chainId,
        paymasters: PAYMASTERS.map((e) => e.dbName),
      },
      {
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        staleTime: Infinity,
      },
    );

  const bunldedOpsPerChain = api.bundlers.totalOpsByChain.useQuery(
    {
      startDate,
      endDate,
      resolution,
      chainIds: [chain.chainId],
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  return (
    <div className="p-8 w-full flex flex-col gap-4">
      <div className="justify-between flex">
        <ChainDropdown selectedChainName={chain.name} />
        <TimefilterDropdown
          selectedTimeFrame={selectedTimeFrame}
          setSelectedTimeFrame={setSelectedTimeFrame}
        />
      </div>
      <StatsHeader
        startDate={startDate}
        endDate={endDate}
        selectedChains={[chain.chainId]}
      />
      <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2">
        <UsageBarChart
          chartTitle={"User operations bundled"}
          chartDescription={"User Operations bundled per day."}
          chartConfig={CHAIN_CHART_CONFIG}
          data={bunldedOpsPerChain.data}
        />
        <UsageTable
          data={opsByPlatform.data?.map((d) => ({
            name: d.platform,
            count: Number(d.count),
          }))}
          title={"Bundler"}
          countLabel={"User Operations Bundled"}
        />
        <UsageTable
          data={sponsoredOpsByPlatform.data?.map((d) => ({
            name: d.platform,
            count: Number(d.count),
          }))}
          title={"Paymaster"}
          countLabel={"User Operations Sponsored"}
        />
      </div>
    </div>
  );
}
