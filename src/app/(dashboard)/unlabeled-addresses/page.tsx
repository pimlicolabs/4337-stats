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
import * as chains from "viem/chains";
import Link from "next/link";

const endDate = new Date();
const startDate = subMonths(endDate, 1);

// Function to get the block explorer URL for a given chain ID and address
const getBlockExplorerUrl = (chainId: number, address: string): string | null => {
  // Find the chain by ID
  const allChains = Object.values(chains);
  const chain = allChains.find((chain) => 
    typeof chain === 'object' && 'id' in chain && chain.id === chainId
  );
  
  if (!chain || !('blockExplorers' in chain) || !chain.blockExplorers) {
    return null;
  }
  
  const explorer = chain.blockExplorers.default;
  if (!explorer) {
    return null;
  }
  
  return `${explorer.url}/address/${address}`;
};

export default function UnlabeledAddressesPage() {  
  const unlabeledBundlers = api.unlabeledAddresses.getUnlabeledBundlers.useQuery(
    {
      startDate,
      endDate
    },
    {
      retry: 1
    }
  );
  
  const unlabeledPaymasters = api.unlabeledAddresses.getUnlabeledPaymasters.useQuery(
    {
      startDate,
      endDate
    },
    {
      retry: 1
    }
  );

  const unlabeledApps = api.unlabeledAddresses.getUnlabeledApps.useQuery(
    {
      startDate,
      endDate
    },
    {
      retry: 1
    }
  );

  const unlabeledFactories = api.unlabeledAddresses.getUnlabeledFactories.useQuery(
    {
      startDate,
      endDate
    },
    {
      retry: 1
    }
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">Unlabeled Addresses</h1>
      
      <div>
        <h2 className="text-2xl">Paymasters</h2>
        <div className="mt-2 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Address</TableHead>
                <TableHead className="w-[100px]">Chain ID</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unlabeledPaymasters.isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : unlabeledPaymasters.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No unlabeled paymasters found
                  </TableCell>
                </TableRow>
              ) : (
                unlabeledPaymasters.data?.map((paymaster) => (
                  <TableRow key={`${paymaster.address}-${paymaster.chainId}`}>
                    <TableCell className="font-mono py-1">
                      {getBlockExplorerUrl(paymaster.chainId, paymaster.address) ? (
                        <Link 
                          href={getBlockExplorerUrl(paymaster.chainId, paymaster.address) as string} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {paymaster.address}
                        </Link>
                      ) : (
                        paymaster.address
                      )}
                    </TableCell>
                    <TableCell className="py-1">{paymaster.chainId}</TableCell>
                    <TableCell className="py-1">{paymaster.count.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl">Bundlers</h2>
        <div className="mt-2 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Address</TableHead>
                <TableHead className="w-[100px]">Chain ID</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unlabeledBundlers.isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : unlabeledBundlers.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No unlabeled bundlers found
                  </TableCell>
                </TableRow>
              ) : (
                unlabeledBundlers.data?.map((bundler) => (
                  <TableRow key={`${bundler.address}-${bundler.chainId}`}>
                    <TableCell className="font-mono py-1">
                      {getBlockExplorerUrl(bundler.chainId, bundler.address) ? (
                        <Link 
                          href={getBlockExplorerUrl(bundler.chainId, bundler.address) as string} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {bundler.address}
                        </Link>
                      ) : (
                        bundler.address
                      )}
                    </TableCell>
                    <TableCell className="py-1">{bundler.chainId}</TableCell>
                    <TableCell className="py-1">{bundler.count.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl">Apps</h2>
        <div className="mt-2 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Address</TableHead>
                <TableHead className="w-[100px]">Chain ID</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unlabeledApps.isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : unlabeledApps.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No unlabeled apps found
                  </TableCell>
                </TableRow>
              ) : (
                unlabeledApps.data?.map((app) => (
                  <TableRow key={`${app.address}-${app.chainId}`}>
                    <TableCell className="font-mono py-1">
                      {getBlockExplorerUrl(app.chainId, app.address) ? (
                        <Link 
                          href={getBlockExplorerUrl(app.chainId, app.address) as string} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {app.address}
                        </Link>
                      ) : (
                        app.address
                      )}
                    </TableCell>
                    <TableCell className="py-1">{app.chainId}</TableCell>
                    <TableCell className="py-1">{app.count.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl">Account Factories</h2>
        <div className="mt-2 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Address</TableHead>
                <TableHead className="w-[100px]">Chain ID</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unlabeledFactories.isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : unlabeledFactories.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No unlabeled factories found
                  </TableCell>
                </TableRow>
              ) : (
                unlabeledFactories.data?.map((factory) => (
                  <TableRow key={`${factory.address}-${factory.chainId}`}>
                    <TableCell className="font-mono py-1">
                      {getBlockExplorerUrl(factory.chainId, factory.address) ? (
                        <Link 
                          href={getBlockExplorerUrl(factory.chainId, factory.address) as string} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          {factory.address}
                        </Link>
                      ) : (
                        factory.address
                      )}
                    </TableCell>
                    <TableCell className="py-1">{factory.chainId}</TableCell>
                    <TableCell className="py-1">{factory.count.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
