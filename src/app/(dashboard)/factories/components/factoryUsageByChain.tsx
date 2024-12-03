"use client";

import { LoadingText } from "@/components/charts/loading";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import { CHAIN_CHART_CONFIG, ACCOUNT_FACTORIES } from "@/lib/registry";
import { TimeFrameResolutionType } from "@/lib/types";
import { PieChart } from "@/components/charts/pieChart";
import { capitalizeAll } from "@/lib/utils";

interface FactoryUsageByChainProps {
  selectedChains: number[];
  selectedFactories: string[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

export default function FactoryUsageByChain({
  selectedChains,
  selectedFactories,
  startDate,
  endDate,
  resolution,
}: FactoryUsageByChainProps) {
  const bundledOpsByChain = api.factories.getAccountsDeployedByChain.useQuery(
    {
      startDate,
      endDate,
      resolution,
      chainIds: selectedChains,
      factories: selectedFactories,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const data = useMemo(() => {
    const data = bundledOpsByChain.data;

    if (data === undefined) {
      return undefined;
    }

    return Object.fromEntries(
      Object.entries(data)
        .map(([factory, accounts_deployed_by_chains]) => {
          const total = accounts_deployed_by_chains.reduce(
            (sum, acounts_deployed_by_chain) =>
              sum + acounts_deployed_by_chain.total_accounts_deployed,
            0,
          );
          return [factory, accounts_deployed_by_chains, total] as [
            string,
            { chain: number; total_accounts_deployed: number }[],
            number,
          ];
        })
        .sort((a, b) => b[2] - a[2])
        // Convert back to [key, value] pairs for Object.fromEntries
        .map(([bundler, op_count_by_chains]) => [bundler, op_count_by_chains]),
    );
  }, [bundledOpsByChain.data]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data ? (
        Object.entries(data).map(([factory, deloymentsPerChain]) => (
          <PieChart
            title={capitalizeAll(
              ACCOUNT_FACTORIES.find((f) => f.dbName === factory)!.name,
            )}
            key={factory}
            innerTitle={deloymentsPerChain
              .reduce((acc, curr) => acc + curr["total_accounts_deployed"], 0)
              .toLocaleString()}
            description={"Accounts deployed"}
            config={CHAIN_CHART_CONFIG}
            data={deloymentsPerChain}
            dataKey={"total_accounts_deployed"}
            nameKey={"chain"}
          />
        ))
      ) : (
        <LoadingText />
      )}
    </div>
  );
}
