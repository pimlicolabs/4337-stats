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

const endDate = new Date();
const startDate = subMonths(endDate, 1);

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
                      {paymaster.address}
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
                      {bundler.address}
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
                      {app.address}
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
                      {factory.address}
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
