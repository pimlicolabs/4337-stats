"use client";

import { StatCard } from "@/components/stats-card";
import { RegistryEntityType } from "@/lib/registry";
import { api } from "@/trpc/react";
import { DollarSign } from "lucide-react";
import { useMemo } from "react";

type GlobalStatsOverviewProps = {
  selectedChains: number[];
  selectedPaymasters: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
};

export default function GlobalStatsOverview({
  selectedChains,
  selectedPaymasters,
  startDate,
  endDate,
}: GlobalStatsOverviewProps) {
  const totalOpsSponsored = api.paymasters.getTotalOpsSponsored.useQuery(
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

  const { globalOpsSponsoredCount } = useMemo(() => {
    return {
      globalOpsSponsoredCount: totalOpsSponsored.data,
    };
  }, [totalOpsSponsored.data]);

  return (
    <>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="User Operations Sponsored"
          value={
            globalOpsSponsoredCount
              ? globalOpsSponsoredCount.toLocaleString()
              : "loading..."
          }
          icon={DollarSign}
        />
      </div>
    </>
  );
}
