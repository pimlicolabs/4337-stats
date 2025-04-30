import { StatCard } from "@/components/stats-card";
import { api } from "@/trpc/react";
import { Box, DollarSign, User } from "lucide-react";
import { ACCOUNT_FACTORIES, BUNDLERS, PAYMASTERS } from "@/lib/registry";

interface StatsHeaderProps {
  startDate: Date;
  endDate: Date;
  selectedChains: number[];
}

export function StatsHeader({
  startDate,
  endDate,
  selectedChains,
}: StatsHeaderProps) {
  const totalOpsBundled = api.bundlers.totalOps.useQuery(
    {
      startDate,
      endDate,
      bundlers: BUNDLERS.map((b) => b.dbName),
      chainIds: selectedChains,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const totalOpsSponsored = api.paymasters.totalSponsored.useQuery(
    {
      startDate,
      endDate,
      paymasters: PAYMASTERS.map((p) => p.dbName),
      chainIds: selectedChains,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const totalAccountsDeployed = api.accounts.totalDeployments.useQuery(
    {
      startDate,
      endDate,
      factories: ACCOUNT_FACTORIES.map((b) => b.dbName),
      chainIds: selectedChains,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        title="User Operations Bundled"
        value={
          totalOpsBundled.data
            ? totalOpsBundled.data.toLocaleString()
            : "Loading..."
        }
        icon={Box}
      />

      <StatCard
        title="User Operations Sponsored"
        value={
          totalOpsSponsored.data
            ? totalOpsSponsored.data.toLocaleString()
            : "Loading..."
        }
        icon={DollarSign}
      />

      <StatCard
        title="Accounts Deployed"
        value={
          totalAccountsDeployed.data
            ? totalAccountsDeployed.data.toLocaleString()
            : "Loading..."
        }
        icon={User}
      />
    </div>
  );
}
