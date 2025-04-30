"use client";

import { calculatePercentageChange, formatTrendDescription, getTrendDirection, StatCard } from "@/components/stats-card";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { RegistryEntityType } from "@/lib/registry";
import { TimeFrameType } from "@/lib/types";
import { api } from "@/trpc/react";
import { subDays } from "date-fns";
import { Box } from "lucide-react";
import { useMemo } from "react";


type GlobalStatsOverviewProps = {
  selectedChains: number[];
  selectedBundlers: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  selectedTimeFrame: TimeFrameType;
};

export default function GlobalStatsOverview({
  selectedChains,
  selectedBundlers,
  startDate,
  endDate,
  selectedTimeFrame,
}: GlobalStatsOverviewProps) {
  const totalGlobalBundledOps = api.bundlers.totalOps.useQuery(
    {
      startDate,
      endDate,
      chainIds: selectedChains,
      bundlers: selectedBundlers.map((b) => b.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );
  const prevTotalGlobalBundledOps = api.bundlers.totalOps.useQuery(
    {
      startDate: subDays(startDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      endDate: subDays(endDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      chainIds: selectedChains,
      bundlers: selectedBundlers.map((b) => b.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const { globalOpsBundledCount, prevGlobalOpsBundledCount } = useMemo(() => {
    return {
      globalOpsBundledCount: totalGlobalBundledOps.data,
      prevGlobalOpsBundledCount: prevTotalGlobalBundledOps.data,
    };
  }, [totalGlobalBundledOps.data, prevTotalGlobalBundledOps.data]);

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="User Operations Bundled"
          value={
            globalOpsBundledCount ? globalOpsBundledCount.toLocaleString() : ""
          }
          icon={Box}
          description={formatTrendDescription(
            globalOpsBundledCount,
            prevGlobalOpsBundledCount,
            selectedTimeFrame,
          )}
          trend={getTrendDirection(
            globalOpsBundledCount,
            prevGlobalOpsBundledCount,
          )}
          trendValue={`${Math.abs(Number(calculatePercentageChange(globalOpsBundledCount, prevGlobalOpsBundledCount)))}%`}
        />
      </div>
    </>
  );
}
