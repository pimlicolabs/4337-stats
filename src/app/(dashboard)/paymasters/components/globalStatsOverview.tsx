"use client";

import { calculatePercentageChange, formatTrendDescription, getTrendDirection, StatCard } from "@/components/stats-card";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { RegistryEntityType } from "@/lib/registry";
import { TimeFrameType } from "@/lib/types";
import { api } from "@/trpc/react";
import { subDays } from "date-fns";
import { DollarSign } from "lucide-react";
import { useMemo } from "react";

type GlobalStatsOverviewProps = {
  selectedChains: number[];
  selectedPaymasters: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  selectedTimeFrame: TimeFrameType;
};

export default function GlobalStatsOverview({
  selectedChains,
  selectedPaymasters,
  startDate,
  endDate,
  selectedTimeFrame,
}: GlobalStatsOverviewProps) {
  const totalOpsSponsored = api.paymasters.totalSponsored.useQuery(
    {
      startDate,
      endDate,
      chainIds: selectedChains,
      paymasters: selectedPaymasters.map((p) => p.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const prevTotalOpsSponsored = api.paymasters.totalSponsored.useQuery(
    {
      startDate: subDays(startDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      endDate: subDays(endDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      chainIds: selectedChains,
      paymasters: selectedPaymasters.map((p) => p.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const { globalOpsSponsoredCount, prevGlobalOpsSponsoredCount } = useMemo(() => {
    return {
      globalOpsSponsoredCount: totalOpsSponsored.data,
      prevGlobalOpsSponsoredCount: prevTotalOpsSponsored.data,
    };
  }, [totalOpsSponsored.data, prevTotalOpsSponsored.data]);

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="User Operations Sponsored"
          value={
            globalOpsSponsoredCount
              ? globalOpsSponsoredCount.toLocaleString()
              : "Loading..."
          }
          icon={DollarSign}
          description={formatTrendDescription(
            globalOpsSponsoredCount,
            prevGlobalOpsSponsoredCount,
            selectedTimeFrame,
          )}
          trend={getTrendDirection(
            globalOpsSponsoredCount,
            prevGlobalOpsSponsoredCount,
          )}
          trendValue={`${Math.abs(Number(calculatePercentageChange(globalOpsSponsoredCount, prevGlobalOpsSponsoredCount)))}%`}
        />
      </div>
    </>
  );
}
