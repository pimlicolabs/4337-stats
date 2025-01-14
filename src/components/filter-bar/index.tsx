import * as React from "react";
import ChainSelector from "./chain-selector";
import EntitySelector from "./entity-selector";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { cn } from "@/lib/utils";
import { TimeFrameType } from "@/lib/types";
import { EntityType, RegistryEntityType } from "@/lib/registry";

interface FilterBarProps {
  entityType?: EntityType;
  setSelectedChains?: (selectedChains: number[]) => void;
  selectedChains?: number[];
  setSelectedEntitys?: (selectedEntitys: RegistryEntityType[]) => void;
  selectedEntitys?: RegistryEntityType[];
  selectedTimeFrame?: string;
  setSelectedTimeFrame?: (timeframe: TimeFrameType) => void;
}

const timeframes = [
  { value: "7d", label: "7d" },
  { value: "14d", label: "14d" },
  { value: "30d", label: "30d" },
  { value: "6mo", label: "6mo" },
];

export default function FilterBar({
  entityType,
  setSelectedChains,
  selectedChains,
  selectedEntitys,
  setSelectedEntitys,
  selectedTimeFrame,
  setSelectedTimeFrame,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between w-full p-4 bg-gray-50 gap-4 border border-gray-200">
      <div className="flex flex-wrap items-center gap-2">
        {selectedChains && setSelectedChains ? (
          <ChainSelector
            selectedChains={selectedChains}
            setSelectedChains={setSelectedChains}
          />
        ) : (
          <></>
        )}
        {entityType && selectedEntitys && setSelectedEntitys ? (
          <EntitySelector
            type={entityType}
            selectedEntitys={selectedEntitys}
            setSelectedEntitys={setSelectedEntitys}
          />
        ) : (
          <></>
        )}
      </div>
      {selectedTimeFrame && setSelectedTimeFrame ? (
        <ToggleGroup
          type="single"
          value={selectedTimeFrame}
          onValueChange={(value) => {
            if (value) setSelectedTimeFrame(value as TimeFrameType);
          }}
          className="bg-white border border-gray-300"
        >
          {timeframes.map((tf) => (
            <ToggleGroupItem
              key={tf.value}
              value={tf.value}
              className={cn(
                "px-3 py-2 text-sm",
                "data-[state=on]:bg-gray-200 data-[state=on]:text-gray-900",
                "hover:bg-gray-100 transition-colors",
                "text-gray-700",
              )}
            >
              {tf.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : (
        <></>
      )}
    </div>
  );
}
