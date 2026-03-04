import type { ConflictEventCategory } from "./events";

export type EventFilterState = {
  categories: ConflictEventCategory[];
  timeRange: "24h" | "7d" | "30d";
};

export const defaultEventFilterState: EventFilterState = {
  categories: ["battle", "explosion", "protest", "civilian", "strategic"],
  timeRange: "7d"
};
