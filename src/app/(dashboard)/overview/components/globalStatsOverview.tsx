"use client";

import { StatCard } from "@/components/stats-card";
import { api } from "@/trpc/react";
import { Activity, Box, DollarSign, User } from "lucide-react";
import { subMonths, startOfMonth, subDays } from "date-fns";
import { useMemo } from "react";
import { ACCOUNT_FACTORIES, BUNDLERS, PAYMASTERS } from "@/lib/registry";

type GlobalStatsOverviewProps = {
  selectedChains: number[];
  startDate: Date;
  endDate: Date;
};

export default function GlobalStatsOverview({
  selectedChains,
  startDate,
  endDate,
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

  const totalOpsSponsoredQuery = api.paymasters.getTotalOpsSponsored.useQuery(
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

  const totalAccountsDeployedQuery =
    api.factories.getTotalAccountsDeployed.useQuery(
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

  const monthlyActiveUsersQuery =
    api.globalStats.getTotalActiveUsersByMonth.useQuery(
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

  const dailyActiveUsersQuery =
    api.globalStats.getTotalActiveUsersByDay.useQuery(
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
  } = useMemo(() => {
    return {
      totalOpsBundled: totalOpsBundledQuery.data,
      totalOpsSponsored: totalOpsSponsoredQuery.data,
      totalAccountsDeployed: totalAccountsDeployedQuery.data,
      monthlyActiveUsers: monthlyActiveUsersQuery.data,
      dailyActiveUsers: dailyActiveUsersQuery.data,
    };
  }, [
    totalOpsBundledQuery.data,
    totalOpsSponsoredQuery.data,
    totalAccountsDeployedQuery.data,
    monthlyActiveUsersQuery.data,
    dailyActiveUsersQuery.data,
  ]);

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="User Operations Bundled"
          value={
            totalOpsBundled ? totalOpsBundled.toLocaleString() : "loading..."
          }
          icon={Box}
        />

        <StatCard
          title="User Operations Sponsored"
          value={
            totalOpsSponsored
              ? totalOpsSponsored.toLocaleString()
              : "loading..."
          }
          icon={DollarSign}
        />

        <StatCard
          title="Accounts Deployed"
          value={
            totalAccountsDeployed
              ? totalAccountsDeployed.toLocaleString()
              : "loading..."
          }
          icon={User}
        />

        <StatCard
          title="User Retention (DAU/MAU)"
          value={
            monthlyActiveUsers && dailyActiveUsers
              ? (dailyActiveUsers / monthlyActiveUsers).toLocaleString()
              : "loading..."
          }
          icon={Activity}
        />
      </div>
    </>
  );
}
