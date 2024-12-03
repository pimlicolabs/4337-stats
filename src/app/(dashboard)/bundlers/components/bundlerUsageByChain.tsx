"use client";

import { LoadingText } from "@/components/charts/loading";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import { CHAIN_CHART_CONFIG } from "@/lib/registry";
import { TimeFrameResolutionType } from "@/lib/types";
import { PieChart } from "@/components/charts/pieChart";

interface BundlerUsageByChainProps {
  selectedChains: number[];
  selectedBundlers: string[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

export default function BundlerUsageByChain({
  selectedChains,
  selectedBundlers,
  startDate,
  endDate,
  resolution,
}: BundlerUsageByChainProps) {
  const bundledOpsByChain = api.bundlers.getBundledOpsByChain.useQuery(
    {
      startDate,
      endDate,
      resolution,
      chainIds: selectedChains,
      bundlers: selectedBundlers,
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
        .map(([bundler, op_count_by_chains]) => {
          const total = op_count_by_chains.reduce(
            (sum, op_count_by_chain) =>
              sum + op_count_by_chain.total_ops_bundled,
            0,
          );
          return [bundler, op_count_by_chains, total] as [
            string,
            { chain: number; total_ops_bundled: number }[],
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
        Object.entries(data).map(([bundler, opsPerChain]) => (
          <PieChart
            title={bundler}
            key={bundler}
            innerTitle={opsPerChain
              .reduce((acc, curr) => acc + curr["total_ops_bundled"], 0)
              .toLocaleString()}
            description={"User operations bundled"}
            config={CHAIN_CHART_CONFIG}
            data={opsPerChain}
            dataKey={"total_ops_bundled"}
            nameKey={"chain"}
          />
        ))
      ) : (
        <LoadingText />
      )}
    </div>
  );
}
