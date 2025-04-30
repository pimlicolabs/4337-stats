"use client";

import { calculatePercentageChange, formatTrendDescription, getTrendDirection, StatCard } from "@/components/stats-card";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { RegistryEntityType } from "@/lib/registry";
import { TimeFrameType } from "@/lib/types";
import { api } from "@/trpc/react";
import { subDays } from "date-fns";
import { Users } from "lucide-react";
import { useMemo } from "react";

type GlobalStatsOverviewProps = {
  selectedChains: number[];
  selectedFactories: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  selectedTimeFrame: TimeFrameType;
};

export default function GlobalStatsOverview({
  selectedChains,
  selectedFactories,
  startDate,
  endDate,
  selectedTimeFrame,
}: GlobalStatsOverviewProps) {
  const totalAccountsDeployed = api.accounts.totalDeployments.useQuery(
    {
      startDate,
      endDate,
      chainIds: selectedChains,
      factories: selectedFactories.map((f) => f.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const prevTotalAccountsDeployed = api.accounts.totalDeployments.useQuery(
    {
      startDate: subDays(startDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      endDate: subDays(endDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      chainIds: selectedChains,
      factories: selectedFactories.map((f) => f.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const { globalAccountsDeployedCount, prevGlobalAccountsDeployedCount } = useMemo(() => {
    return {
      globalAccountsDeployedCount: totalAccountsDeployed.data,
      prevGlobalAccountsDeployedCount: prevTotalAccountsDeployed.data,
    };
  }, [totalAccountsDeployed.data, prevTotalAccountsDeployed.data]);

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Accounts Deployed"
          value={
            globalAccountsDeployedCount
              ? globalAccountsDeployedCount.toLocaleString()
              : "Loading..."
          }
          icon={Users}
          description={formatTrendDescription(
            globalAccountsDeployedCount,
            prevGlobalAccountsDeployedCount,
            selectedTimeFrame,
          )}
          trend={getTrendDirection(
            globalAccountsDeployedCount,
            prevGlobalAccountsDeployedCount,
          )}
          trendValue={`${Math.abs(Number(calculatePercentageChange(globalAccountsDeployedCount, prevGlobalAccountsDeployedCount)))}%`}
        />
      </div>
    </>
  );
}
