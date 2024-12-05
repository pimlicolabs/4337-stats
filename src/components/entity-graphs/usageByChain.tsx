"use client";

import { LoadingText } from "@/components/charts/loading";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import {
  BUNDLER_CHART_CONFIG,
  CHAIN_CHART_CONFIG,
  EntityType,
  FACTORY_CHART_CONFIG,
  PAYMASTER_CHART_CONFIG,
  RegistryEntityType,
} from "@/lib/registry";
import { TimeFrameResolutionType } from "@/lib/types";
import { PieChart } from "@/components/charts/pieChart";

interface UsageByChainProps {
  entityType: EntityType;
  chartDescription: string;
  selectedChains: number[];
  selectedEntity: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

export default function UsageByChain({
  entityType,
  selectedChains,
  selectedEntity,
  startDate,
  endDate,
  resolution,
  chartDescription,
}: UsageByChainProps) {
  let query: any;
  let queryParams;
  let chartConfig;
  switch (entityType) {
    case "bundler":
      query = api.bundlers.getBundledOpsByChain;
      queryParams = {
        startDate,
        endDate,
        resolution,
        chainIds: selectedChains,
        bundlers: selectedEntity.map((e) => e.dbName),
      };
      chartConfig = BUNDLER_CHART_CONFIG;
      break;
    case "paymaster":
      query = api.paymasters.getSponsoredOpsByChain;
      queryParams = {
        startDate,
        endDate,
        resolution,
        chainIds: selectedChains,
        paymasters: selectedEntity.map((e) => e.dbName),
      };
      chartConfig = PAYMASTER_CHART_CONFIG;
      break;
    case "account_factory":
      query = api.factories.getAccountsDeployedByChain;
      queryParams = {
        startDate,
        endDate,
        resolution,
        chainIds: selectedChains,
        factories: selectedEntity.map((e) => e.dbName),
      };
      chartConfig = FACTORY_CHART_CONFIG;
      break;
  }

  if (!entityType || !query || !queryParams) {
    return null;
  }

  const queryResult = query.useQuery(queryParams, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  const data = useMemo(() => {
    const data = queryResult.data;

    if (data === undefined) {
      return undefined;
    }

    return Object.fromEntries(
      Object.entries(data)
        .map(([entity, chain_count]) => {
          const total = (chain_count as any).reduce(
            (sum: any, count_by_chain: any) => sum + count_by_chain["count"],
            0,
          );

          return [entity, chain_count, total] as [
            string,
            { chain: number; count: number }[],
            number,
          ];
        })
        .sort((a, b) => b[2] - a[2])
        // Convert back to [key, value] pairs for Object.fromEntries
        .map(([entity, count]) => [entity, count]),
    );
  }, [queryResult.data]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data ? (
        Object.entries(data).map(([entity, countPerChain]) => (
          <PieChart
            title={entity}
            key={entity}
            innerTitle={countPerChain
              .reduce((acc, curr) => acc + curr["count"], 0)
              .toLocaleString()}
            description={chartDescription}
            config={CHAIN_CHART_CONFIG}
            data={countPerChain}
            dataKey={"count"}
            nameKey={"chain"}
          />
        ))
      ) : (
        <LoadingText />
      )}
    </div>
  );
}
