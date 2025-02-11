"use client";

import { StatCard } from "@/components/stats-card";
import { RegistryEntityType } from "@/lib/registry";
import { api } from "@/trpc/react";
import { Users } from "lucide-react";
import { useMemo } from "react";

type GlobalStatsOverviewProps = {
  selectedChains: number[];
  selectedFactories: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
};

export default function GlobalStatsOverview({
  selectedChains,
  selectedFactories,
  startDate,
  endDate,
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

  const { globalAccountsDeployedCount } = useMemo(() => {
    return {
      globalAccountsDeployedCount: totalAccountsDeployed.data,
    };
  }, [totalAccountsDeployed.data]);

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Accounts Deployed"
          value={
            globalAccountsDeployedCount
              ? globalAccountsDeployedCount.toLocaleString()
              : "loading..."
          }
          icon={Users}
        />
      </div>
    </>
  );
}
