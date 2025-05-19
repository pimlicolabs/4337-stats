"use client";

import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PieChart } from "@/components/charts/pieChart";
import { subMonths } from "date-fns";
import React, { Suspense, useState } from "react";

const endDate = new Date();
const startDate = subMonths(endDate, 1);

// Analysis content component for the modal
interface AnalysisContentProps {
  address: string;
  addressType: "bundler" | "paymaster";
  title: string;
}

function AnalysisContent({ address, addressType, title }: AnalysisContentProps) {
  const distributionData = api.unlabeledAddresses.getRandomUserOperationStatsFor.useQuery(
    {
      address,
      addressType,
      limit: 1000
    },
    {
      enabled: !!address && !!addressType,
      refetchOnWindowFocus: false
    }
  );

  // Prepare chart config from the distribution data
  const chartConfig = React.useMemo(() => {
    if (!distributionData.data) return {};
    
    return distributionData.data.reduce((config: Record<string, { color: string, name: string }>, item) => {
      // Use address as the key instead of label to ensure uniqueness
      config[item.address] = { color: item.color, name: item.label };
      return config;
    }, {});
  }, [distributionData.data]);

  return (
    <div>
      <h3 className="text-xl font-medium mb-4">{title}</h3>
      
      {distributionData.isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading data...</p>
        </div>
      ) : distributionData.isError ? (
        <div className="flex justify-center items-center h-64">
          <p>Error loading data</p>
        </div>
      ) : distributionData.data?.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p>No data available</p>
        </div>
      ) : (
        <div className="h-80">
          <PieChart
            title={addressType === "bundler" ? "Paymasters" : "Bundlers"}
            innerTitle="Distribution"
            description={`Distribution of ${addressType === "bundler" ? "paymasters" : "bundlers"} for ${address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'unknown'}`}
            config={chartConfig}
            data={distributionData.data || []}
            dataKey="percentage"
            nameKey="address"
          />
        </div>
      )}
    </div>
  );
}

// Wrapper component that uses the search params
function UnlabeledAddressesContent() {  
  // Date range parameters (fixed for now, could be made configurable later)
  const startDateParam = startDate.toISOString();
  const endDateParam = endDate.toISOString();

  // Query for unlabeled addresses with refetchOnWindowFocus disabled to prevent data reset
  const unlabeledBundlers = api.unlabeledAddresses.getUnlabeledBundlers.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false
    }
  );
  
  const unlabeledPaymasters = api.unlabeledAddresses.getUnlabeledPaymasters.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false
    }
  );

  const unlabeledApps = api.unlabeledAddresses.getUnlabeledApps.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false
    }
  );

  const unlabeledFactories = api.unlabeledAddresses.getUnlabeledFactories.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false
    }
  );

  // Create a client for direct API calls
  const apiClient = api.useUtils();
  


  // State for the inspection modal
  const [isInspectOpen, setIsInspectOpen] = useState(false);
  const [inspectedAddress, setInspectedAddress] = useState("");
  const [addressType, setAddressType] = useState<"bundler" | "paymaster">("bundler");
  const [distributionTitle, setDistributionTitle] = useState("");

  // Function to open the inspection modal
  const openInspectModal = (address: string, type: "bundler" | "paymaster") => {
    setInspectedAddress(address);
    setAddressType(type);
    setDistributionTitle(type === "bundler" ? "Paymasters distribution" : "Bundlers distribution");
    setIsInspectOpen(true);
  };

  // Simple table component for reuse
  interface SimpleTableProps {
    title: string;
    data: { address: string; count: number; chainId?: number }[] | undefined;
    isLoading: boolean;
  }

  const SimpleTable: React.FC<SimpleTableProps> = ({ 
    title, 
    data, 
    isLoading, 
  }) => {
    return (
      <div>
        <h2 className="text-2xl mb-2">{title}</h2>
        <div className="mt-2 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Address</TableHead>
                <TableHead>Count</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !data || data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No unlabeled {title.toLowerCase()} found
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow key={`${item.address}-${item.chainId || ''}`}>
                    <TableCell className="font-mono py-1">
                      {item.address}
                    </TableCell>
                    <TableCell className="py-1">{item.count.toLocaleString()}</TableCell>
                    <TableCell className="py-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openInspectModal(item.address, title.toLowerCase() === "paymasters" ? "paymaster" : "bundler")}
                      >
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };


  
  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">Unlabeled Addresses</h1>
      
      {/* Inspection Modal */}
      <Sheet open={isInspectOpen} onOpenChange={setIsInspectOpen}>
        <SheetContent side="right" className="w-1/3 sm:max-w-none">
          <SheetHeader>
            <SheetTitle>Analysis</SheetTitle>
            <p className="text-muted-foreground mt-2 font-mono">{inspectedAddress}</p>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <AnalysisContent address={inspectedAddress} addressType={addressType} title={distributionTitle} />
          </div>
        </SheetContent>
      </Sheet>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-8">
          {/* Paymasters Table */}
          <SimpleTable
            title="Paymasters"
            data={unlabeledPaymasters.data}
            isLoading={unlabeledPaymasters.isLoading}
          />
          
          {/* Bundlers Table */}
          <SimpleTable
            title="Bundlers"
            data={unlabeledBundlers.data}
            isLoading={unlabeledBundlers.isLoading}
          />
          
          {/* Account Factories Table */}
          <SimpleTable
            title="Account Factories"
            data={unlabeledFactories.data}
            isLoading={unlabeledFactories.isLoading}
          />
          
          {/* Apps Table */}
          <SimpleTable
            title="Apps"
            data={unlabeledApps.data}
            isLoading={unlabeledApps.isLoading}
          />
        </div>
      </div>
    </div>
  );
}

// Main page component wrapped in Suspense
export default function UnlabeledAddressesPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <UnlabeledAddressesContent />
    </Suspense>
  );
}
