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

export default function AddressBookPage() {
  const bundlers = api.addressBook.getBundlers.useQuery();
  const paymasters = api.addressBook.getPaymasters.useQuery();
  const factories = api.addressBook.getFactories.useQuery();

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">Address Book</h1>
      <div>
        <h2 className="text-2xl">Factories</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Address</TableHead>
              <TableHead>Factory</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factories.data?.map((factory) => (
              <TableRow key={factory.address}>
                <TableCell className="font-mono py-1">
                  {factory.address}
                </TableCell>
                <TableCell className="py-1">{factory.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div>
        <h2 className="text-2xl">Paymasters</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Address</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paymasters.data?.map((paymaster) => (
              <TableRow key={paymaster.address}>
                <TableCell className="font-mono py-1">
                  {paymaster.address}
                </TableCell>
                <TableCell className="py-1">{paymaster.name}</TableCell>
                <TableCell className="py-1">{paymaster.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div>
        <h2 className="text-2xl">Bundlers</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Address</TableHead>
              <TableHead>Provider</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundlers.data?.map((bundler) => (
              <TableRow key={bundler.address}>
                <TableCell className="font-mono py-1">
                  {bundler.address}
                </TableCell>
                <TableCell className="py-1">{bundler.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
