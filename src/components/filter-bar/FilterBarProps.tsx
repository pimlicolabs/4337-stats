import { EntityType } from "@/lib/registry";
import { TimeFrameType } from "../../lib/types";

export interface FilterBarProps {
  entityType: EntityType;
  setSelectedChains: (selectedChains: number[]) => void;
  selectedChains: number[];
  setSelectedEntitys: (selectedEntitys: string[]) => void;
  selectedEntitys: string[];
  selectedTimeFrame: string;
  setSelectedTimeFrame: (timeframe: TimeFrameType) => void;
}
