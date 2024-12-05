"use client";

import { LoadingText } from "@/components/charts/loading";
import { useMemo } from "react";
import { api } from "@/trpc/react";
import { CHAIN_CHART_CONFIG, RegistryEntityType } from "@/lib/registry";
import { TimeFrameResolutionType } from "@/lib/types";
import { PieChart } from "@/components/charts/pieChart";

interface PaymasterUsageByChainProps {
  selectedChains: number[];
  selectedPaymasters: RegistryEntityType[];
  startDate: Date;
  endDate: Date;
  resolution: TimeFrameResolutionType;
}

export default function PaymasterUsageByChain({
  selectedChains,
  selectedPaymasters,
  startDate,
  endDate,
  resolution,
}: PaymasterUsageByChainProps) {
  const sponsoredOpsByChain = api.paymasters.getSponsoredOpsByChain.useQuery(
    {
      startDate,
      endDate,
      resolution,
      chainIds: selectedChains,
      paymasters: selectedPaymasters.map((p) => p.dbName),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
    },
  );

  const data = useMemo(() => {
    const data = sponsoredOpsByChain.data;

    if (data === undefined) {
      return undefined;
    }

    return Object.fromEntries(
      Object.entries(data)
        .map(([paymaster, sponsor_count_by_chain]) => {
          const total = sponsor_count_by_chain.reduce(
            (sum, op_count_by_chain) =>
              sum + op_count_by_chain.total_ops_sponsored,
            0,
          );
          return [paymaster, sponsor_count_by_chain, total] as [
            string,
            { chain: number; total_ops_sponsored: number }[],
            number,
          ];
        })
        .sort((a, b) => b[2] - a[2])
        // Convert back to [key, value] pairs for Object.fromEntries
        .map(([paymaster, total_ops_sponsored]) => [
          paymaster,
          total_ops_sponsored,
        ]),
    );
  }, [sponsoredOpsByChain.data]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data ? (
        Object.entries(data).map(([bundler, sponsoredOpsPerChain]) => (
          <PieChart
            title={bundler}
            key={bundler}
            innerTitle={sponsoredOpsPerChain
              .reduce((acc, curr) => acc + curr["total_ops_sponsored"], 0)
              .toLocaleString()}
            description={"User operations sponsored"}
            config={CHAIN_CHART_CONFIG}
            data={sponsoredOpsPerChain}
            dataKey={"total_ops_sponsored"}
            nameKey={"chain"}
          />
        ))
      ) : (
        <LoadingText />
      )}
    </div>
  );
}
