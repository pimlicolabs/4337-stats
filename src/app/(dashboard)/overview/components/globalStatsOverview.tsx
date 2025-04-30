"use client";

import { calculatePercentageChange, formatTrendDescription, getTrendDirection, StatCard } from "@/components/stats-card";
import { TIME_PERIOD_TO_DAYS } from "@/lib/constants";
import { api } from "@/trpc/react";
import { Activity, Box, DollarSign, User } from "lucide-react";
import { subMonths, startOfMonth, subDays } from "date-fns";
import { useMemo } from "react";
import { ACCOUNT_FACTORIES, BUNDLERS, PAYMASTERS } from "@/lib/registry";
import { TimeFrameType } from "@/lib/types";

type GlobalStatsOverviewProps = {
  selectedChains: number[];
  startDate: Date;
  endDate: Date;
  selectedTimeFrame: TimeFrameType;
};

export default function GlobalStatsOverview({
  selectedChains,
  startDate,
  endDate,
  selectedTimeFrame,
}: GlobalStatsOverviewProps) {
  const totalOpsBundledQuery = api.bundlers.totalOps.useQuery(
    {
      startDate,
      endDate,
      chainIds: selectedChains,
      bundlers: BUNDLERS.map((b) => b.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const prevTotalOpsBundledQuery = api.bundlers.totalOps.useQuery(
    {
      startDate: subDays(startDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      endDate: subDays(endDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      chainIds: selectedChains,
      bundlers: BUNDLERS.map((b) => b.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const totalOpsSponsoredQuery = api.paymasters.totalSponsored.useQuery(
    {
      startDate,
      endDate,
      chainIds: selectedChains,
      paymasters: PAYMASTERS.map((b) => b.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const prevTotalOpsSponsoredQuery = api.paymasters.totalSponsored.useQuery(
    {
      startDate: subDays(startDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      endDate: subDays(endDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      chainIds: selectedChains,
      paymasters: PAYMASTERS.map((b) => b.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const totalAccountsDeployedQuery = api.accounts.totalDeployments.useQuery(
    {
      startDate,
      endDate,
      chainIds: selectedChains,
      factories: ACCOUNT_FACTORIES.map((b) => b.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const prevTotalAccountsDeployedQuery = api.accounts.totalDeployments.useQuery(
    {
      startDate: subDays(startDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      endDate: subDays(endDate, TIME_PERIOD_TO_DAYS[selectedTimeFrame]),
      chainIds: selectedChains,
      factories: ACCOUNT_FACTORIES.map((b) => b.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const monthlyActiveUsersQuery = api.globalStats.monthlyActiveUsers.useQuery(
    {
      month: startOfMonth(subMonths(new Date(), 1)),
      chainIds: selectedChains,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const dailyActiveUsersQuery = api.globalStats.activeUsersByDay.useQuery(
    {
      day: subDays(endDate, 1),
      chainIds: selectedChains,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const {
    totalOpsBundled,
    totalOpsSponsored,
    totalAccountsDeployed,
    monthlyActiveUsers,
    dailyActiveUsers,
    prevTotalOpsBundled,
    prevTotalOpsSponsored,
    prevTotalAccountsDeployed,
  } = useMemo(() => {
    return {
      totalOpsBundled: totalOpsBundledQuery.data,
      totalOpsSponsored: totalOpsSponsoredQuery.data,
      totalAccountsDeployed: totalAccountsDeployedQuery.data,
      monthlyActiveUsers: monthlyActiveUsersQuery.data,
      dailyActiveUsers: dailyActiveUsersQuery.data,
      prevTotalOpsBundled: prevTotalOpsBundledQuery.data,
      prevTotalOpsSponsored: prevTotalOpsSponsoredQuery.data,
      prevTotalAccountsDeployed: prevTotalAccountsDeployedQuery.data,
    };
  }, [
    totalOpsBundledQuery.data,
    totalOpsSponsoredQuery.data,
    totalAccountsDeployedQuery.data,
    monthlyActiveUsersQuery.data,
    dailyActiveUsersQuery.data,
    prevTotalOpsBundledQuery.data,
    prevTotalOpsSponsoredQuery.data,
    prevTotalAccountsDeployedQuery.data,
  ]);

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="User Operations Bundled"
          value={
            totalOpsBundled ? totalOpsBundled.toLocaleString() : "Loading..."
          }
          icon={Box}
          description={formatTrendDescription(
            totalOpsBundled,
            prevTotalOpsBundled,
            selectedTimeFrame,
          )}
          trend={getTrendDirection(
            totalOpsBundled,
            prevTotalOpsBundled,
          )}
          trendValue={`${Math.abs(Number(calculatePercentageChange(totalOpsBundled, prevTotalOpsBundled)))}%`}
        />

        <StatCard
          title="User Operations Sponsored"
          value={
            totalOpsSponsored
              ? totalOpsSponsored.toLocaleString()
              : "Loading..."
          }
          icon={DollarSign}
          description={formatTrendDescription(
            totalOpsSponsored,
            prevTotalOpsSponsored,
            selectedTimeFrame,
          )}
          trend={getTrendDirection(
            totalOpsSponsored,
            prevTotalOpsSponsored,
          )}
          trendValue={`${Math.abs(Number(calculatePercentageChange(totalOpsSponsored, prevTotalOpsSponsored)))}%`}
        />

        <StatCard
          title="Accounts Deployed"
          value={
            totalAccountsDeployed
              ? totalAccountsDeployed.toLocaleString()
              : "Loading..."
          }
          icon={User}
          description={formatTrendDescription(
            totalAccountsDeployed,
            prevTotalAccountsDeployed,
            selectedTimeFrame,
          )}
          trend={getTrendDirection(
            totalAccountsDeployed,
            prevTotalAccountsDeployed,
          )}
          trendValue={`${Math.abs(Number(calculatePercentageChange(totalAccountsDeployed, prevTotalAccountsDeployed)))}%`}
        />

        <StatCard
          title="User Retention (DAU/MAU)"
          value={
            monthlyActiveUsers && dailyActiveUsers
              ? (dailyActiveUsers / monthlyActiveUsers).toLocaleString()
              : "Loading..."
          }
          icon={Activity}
        />
      </div>
    </>
  );
}
