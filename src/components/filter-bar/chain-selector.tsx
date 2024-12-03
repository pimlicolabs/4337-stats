import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { CHAINS } from "@/lib/registry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "../ui/checkbox";
import React from "react";

export type ChainSelectorProps = {
  setSelectedChains: (selectedChains: number[]) => void;
  selectedChains: number[];
};

const chains = [
  ...CHAINS.map((chain) => ({
    id: chain.chainId,
    isTestnet: chain.isTestnet,
    label: chain.name,
  })),
];

export default function ChainSelector({
  setSelectedChains,
  selectedChains,
}: ChainSelectorProps) {
  const mainnetChains = chains.filter((chain) => !chain.isTestnet);
  const testnetChains = chains.filter((chain) => chain.isTestnet);

  const handleChainToggle = (chainId: number) => {
    if (selectedChains.includes(chainId)) {
      setSelectedChains(selectedChains.filter((id) => id !== chainId));
    } else {
      setSelectedChains([...selectedChains, chainId]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-50 justify-between">
          Chains
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select Chains</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-y-auto">
          <DropdownMenuLabel className="font-bold">Mainnet</DropdownMenuLabel>
          <DropdownMenuGroup>
            {mainnetChains.map((chain) => (
              <DropdownMenuItem
                className="flex flex-row items-center px-2"
                key={chain.id.toString()}
                onClick={(event) => {
                  event.preventDefault();
                  handleChainToggle(chain.id);
                }}
              >
                <Checkbox
                  id={chain.id.toString()}
                  checked={selectedChains.includes(chain.id)}
                />
                <label htmlFor={chain.id.toString()} className="cursor-pointer">
                  {chain.label}
                </label>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />

          <DropdownMenuLabel className="font-bold">Testnets</DropdownMenuLabel>
          <DropdownMenuGroup>
            {testnetChains.map((chain) => (
              <DropdownMenuItem
                className="flex flex-row items-center px-2"
                key={chain.id.toString()}
                onClick={(event) => {
                  event.preventDefault();
                  handleChainToggle(chain.id);
                }}
              >
                <Checkbox
                  id={chain.id.toString()}
                  checked={selectedChains.includes(chain.id)}
                />
                <label htmlFor={chain.id.toString()} className="cursor-pointer">
                  {chain.label}
                </label>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
