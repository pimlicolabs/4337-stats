import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { BUNDLERS, PAYMASTERS, ACCOUNT_FACTORIES } from "@/lib/registry";
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

export type EntityType = "paymaster" | "bundler" | "account_factory";

export type EntitySelectorProps = {
  setSelectedEntitys: (selectedEntitys: string[]) => void;
  selectedEntitys: string[];
  type: EntityType;
};

export default function EntitySelector({
  setSelectedEntitys,
  selectedEntitys,
  type,
}: EntitySelectorProps) {
  const handleToggle = (entityName: string) => {
    if (selectedEntitys.includes(entityName)) {
      setSelectedEntitys(selectedEntitys.filter((name) => name !== entityName));
    } else {
      setSelectedEntitys([...selectedEntitys, entityName]);
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
                  handleToggle(entity.name);
                }}
              >
                <Checkbox
                  id={entity.name.toString()}
                  checked={selectedEntitys.includes(entity.name)}
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
