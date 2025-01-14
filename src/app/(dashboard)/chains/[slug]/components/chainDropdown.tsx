"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CHAINS } from "@/lib/registry";

//<select
//  className="text-3xl font-bold bg-transparent cursor-pointer hover:opacity-80 transition-opacity"
//  value={chain.slugName}
//  onChange={(e) => {
//    window.location.href = `/chains/${e.target.value}`;
//  }}
//>
//  <option value={chain.slugName}>{chain.name} Stats</option>
//  {CHAINS.filter((c) => c.slugName !== chain.slugName).map((c) => (
//    <option key={c.slugName} value={c.slugName}>
//      {c.name} Stats
//    </option>
//  ))}
//</select>

interface ChainDropdownProps {
  selectedChainName: string;
}

export default function ChainDropdown({
  selectedChainName,
}: ChainDropdownProps) {
  const mainnetChains = CHAINS.filter((chain) => !chain.isTestnet);
  const testnetChains = CHAINS.filter((chain) => chain.isTestnet);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {selectedChainName} Stats
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <DropdownMenuLabel className="font-bold">Mainnet</DropdownMenuLabel>
        <DropdownMenuGroup>
          {mainnetChains.map((chain) => (
            <DropdownMenuItem
              key={chain.name}
              onClick={(event) => {
                event.preventDefault();
                window.location.href = `/chains/${chain.slugName}`;
              }}
            >
              {chain.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="font-bold">Testnets</DropdownMenuLabel>
        <DropdownMenuGroup>
          {testnetChains.map((chain) => (
            <DropdownMenuItem
              className="flex flex-row items-center px-2"
              key={chain.name}
              onClick={(event) => {
                event.preventDefault();
                window.location.href = `/chains/${chain.slugName}`;
              }}
            >
              {chain.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
