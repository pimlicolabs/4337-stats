import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  BUNDLERS,
  PAYMASTERS,
  ACCOUNT_FACTORIES,
  RegistryEntityType,
} from "@/lib/registry";
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

export type EntityType =
  | "paymaster"
  | "bundler"
  | "account_factory"
  | undefined;

export type EntitySelectorProps = {
  setSelectedEntitys: (selectedEntitys: RegistryEntityType[]) => void;
  selectedEntitys: RegistryEntityType[];
  type: EntityType;
};

export default function EntitySelector({
  setSelectedEntitys,
  selectedEntitys,
  type,
}: EntitySelectorProps) {
  if (!type) {
    return;
  }

  const handleToggle = (toggledEntity: RegistryEntityType) => {
    if (selectedEntitys.includes(toggledEntity)) {
      setSelectedEntitys(
        selectedEntitys.filter((entity) => entity !== toggledEntity),
      );
    } else {
      setSelectedEntitys([...selectedEntitys, toggledEntity]);
    }
  };

  const title = () => {
    if (type === "paymaster") {
      return "Paymasters";
    }

    if (type === "bundler") {
      return "Bundlers";
    }

    return "Account Factories";
  };

  const entities = () => {
    if (type === "paymaster") {
      return PAYMASTERS;
    }

    if (type === "bundler") {
      return BUNDLERS;
    }

    return ACCOUNT_FACTORIES;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-50 justify-between">
          {title()}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select {title()}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-y-auto">
          <DropdownMenuGroup>
            {entities().map((entity) => (
              <DropdownMenuItem
                className="flex flex-row items-center px-2"
                key={entity.name.toString()}
                onClick={(event) => {
                  event.preventDefault();
                  handleToggle(entity);
                }}
              >
                <Checkbox
                  id={entity.name.toString()}
                  checked={selectedEntitys.includes(entity)}
                />
                <label
                  htmlFor={entity.name.toString()}
                  className="cursor-pointer"
                >
                  {entity.name}
                </label>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
