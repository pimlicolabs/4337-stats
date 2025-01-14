import * as React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TimeFrameType } from "@/lib/types";
import { cn } from "@/lib/utils";

const timeframes = [
  { value: "7d", label: "7d" },
  { value: "14d", label: "14d" },
  { value: "30d", label: "30d" },
  { value: "6mo", label: "6mo" },
];

interface TimeFilterDropdownProps {
  selectedTimeFrame: string;
  setSelectedTimeFrame: (timeframe: TimeFrameType) => void;
}

export default function TimefilterDropdown({
  selectedTimeFrame,
  setSelectedTimeFrame,
}: TimeFilterDropdownProps) {
  return (
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
  );
}
