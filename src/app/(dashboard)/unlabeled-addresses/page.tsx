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
import { subMonths } from "date-fns";
import { Suspense } from "react";

const endDate = new Date();
const startDate = subMonths(endDate, 1);

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
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : !data || data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4">
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
