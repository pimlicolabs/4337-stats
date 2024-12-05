"use client";

import { LoadingText } from "@/components/charts/loading";
import ChartBlock from "@/components/charts/chartBlock";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import {
  BUNDLER_CHART_CONFIG,
  EntityType,
  FACTORY_CHART_CONFIG,
  PAYMASTER_CHART_CONFIG,
  RegistryEntityType,
} from "@/lib/registry";
import StackedPercentChart from "@/components/charts/stackedAreaChart";
import { TimeFrameResolutionType } from "@/lib/types";

interface MarketshareChartProps {
  chartTitle: string;
  chartDescription: string;
  entityType: EntityType;
  selectedChains: number[];
  selectedEntity: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

export default function MarketshareChart({
  chartTitle,
  chartDescription,
  selectedChains,
  selectedEntity,
  entityType,
  startDate,
  endDate,
  resolution,
}: MarketshareChartProps) {
  if (!entityType) {
    return null;
  }

  let query: any;
  let queryParams;
  let chartConfig;
  switch (entityType) {
    case "bundler":
      query = api.bundlers.getBundledOpsCount;
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
      query = api.paymasters.getSponsoredOpsCount;
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
      query = api.factories.getDeploymentCount;
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

  const usageByEntity = query.useQuery(queryParams, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });

  const data = useMemo(() => {
    return usageByEntity.data || [];
  }, [usageByEntity.data]);

  return (
    <>
      <ChartBlock title={chartTitle} description={chartDescription}>
        {data.isFetching ? (
          <LoadingText />
        ) : (
          <div className="w-full">
            <StackedPercentChart
              showLegend={false}
              data={data}
              config={chartConfig}
              xAxisKey="date"
              xAxisFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                });
              }}
            />
          </div>
        )}
      </ChartBlock>
    </>
  );
}
