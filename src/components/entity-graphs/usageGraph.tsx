"use client";

import { LoadingText } from "@/components/charts/loading";
import ChartBlock from "@/components/charts/chartBlock";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import StackedBarChart from "@/components/charts/stackedBarChart";
import {
  EntityType,
  BUNDLER_CHART_CONFIG,
  FACTORY_CHART_CONFIG,
  PAYMASTER_CHART_CONFIG,
  RegistryEntityType,
} from "@/lib/registry";
import { TimeFrameResolutionType } from "@/lib/types";

interface UsageByEntityChartProps {
  entityType: EntityType;
  chartTitle: string;
  chartDescription: string;
  selectedChains: number[];
  selectedEntity: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

export default function UsageByEntityChart({
  entityType,
  selectedChains,
  selectedEntity,
  startDate,
  endDate,
  resolution,
  chartTitle,
  chartDescription,
}: UsageByEntityChartProps) {
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
        {usageByEntity.isFetching ? (
          <LoadingText />
        ) : (
          <div className="w-full">
            <StackedBarChart
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
