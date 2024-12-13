"use client";

import { StatCard } from "@/components/stats-card";
import { api } from "@/trpc/react";
import { Box, DollarSign, User } from "lucide-react";
import { useMemo } from "react";
import { ACCOUNT_FACTORIES, BUNDLERS, PAYMASTERS } from "@/lib/registry";
import { UTCDate } from "@date-fns/utc";

type GlobalStatsOverviewProps = {
  selectedChains: number[];
};

const startDate = new UTCDate("2023-01-01");
const endDate = new UTCDate();

export default function GlobalStatsOverview({
  selectedChains,
}: GlobalStatsOverviewProps) {
  const totalOpsBundledQuery = api.bundlers.getTotalBundledOps.useQuery(
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

  const { totalOpsBundled, totalOpsSponsored, totalAccountsDeployed } =
    useMemo(() => {
      return {
        totalOpsBundled: totalOpsBundledQuery.data,
        totalOpsSponsored: totalOpsSponsoredQuery.data,
        totalAccountsDeployed: totalAccountsDeployedQuery.data,
      };
    }, [
      totalOpsBundledQuery.data,
      totalOpsSponsoredQuery.data,
      totalAccountsDeployedQuery.data,
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
          description={`${totalAccountsDeployed} accounts deployed`}
          icon={User}
        />
      </div>
    </>
  );
}
