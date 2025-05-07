"use client";

import { APPS_CHART_CONFIG, CHAINS } from "@/lib/registry";
import FilterBar from "@/components/filter-bar";
import { useMemo, useState } from "react";
import { TimeFrameResolutionType, TimeFrameType } from "@/lib/types";
import { UTCDate } from "@date-fns/utc";
import { endOfDay, subDays } from "date-fns";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import UsageBarChart from "@/components/custom-components/usageGraph";
import { api } from "@/trpc/react";
import { UsageTable } from "@/components/custom-components/usageTable";

export default function AppsPage() {
  const startTimeframe = "7d";
  const startChains = CHAINS.filter((c) => !c.isTestnet).map((c) => c.chainId); // only mainnets

  const [selectedChains, setSelectedChains] = useState<number[]>(startChains);
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

  const appsByPlatform = api.apps.appUsageByDate.useQuery(
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

  return (
    <div className="p-8 w-full flex flex-col gap-4">
      <h1 className="text-3xl font-bold">App Usage Stats</h1>
      <FilterBar
        setSelectedChains={setSelectedChains}
        selectedChains={selectedChains}
        selectedTimeFrame={selectedTimeFrame}
        setSelectedTimeFrame={setSelectedTimeFrame}
      />
      <div className="w-full gap-4 grid grid-cols-1 md:grid-cols-2">
        <UsageBarChart
          chartConfig={APPS_CHART_CONFIG}
          chartTitle="App Usage"
          chartDescription="User operations per app"
          data={appsByPlatform.data}
        />
        <UsageTable
          data={sumLabels(appsByPlatform.data)}
          //data={sumLabels.map((a) => ({
          //  name: a.name,
          //  count: Number(a.count),
          //}))}
          title={"App"}
          countLabel={"App usage (aggregate all days)"}
        />
      </div>
    </div>
  );
}

function sumLabels(
  data: Record<string, any>[] | undefined,
): Array<{ name: string; count: number }> {
  if (!data) return [];

  const sums = data.reduce<Record<string, number>>((acc, entry) => {
    Object.entries(entry).forEach(([key, value]) => {
      if (key !== "date" && typeof value === "number") {
        acc[key] = (acc[key] || 0) + value;
      }
    });
    return acc;
  }, {});

  // Transform the record into array of { name, count } objects
  return Object.entries(sums).map(([name, count]) => ({
    name,
    count,
  }));
}
