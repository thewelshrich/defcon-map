export type ConflictEventCategory =
  | "battle"
  | "explosion"
  | "protest"
  | "civilian"
  | "strategic";

export type EventConfidence = "high" | "medium" | "low";
export type EventSeverity = "low" | "medium" | "high" | "critical";
export type EventScope = "geopolitical" | "domestic" | "infrastructure" | "policy";
export type PlotVisibility = "plot" | "hide";

export type ConflictEvent = {
  id: string;
  occurredAt: string;
  countryCode: string;
  countryName: string;
  locationName: string | null;
  actor1Name: string | null;
  actor1CountryCode: string | null;
  actor2Name: string | null;
  actor2CountryCode: string | null;
  latitude: number;
  longitude: number;
  category: ConflictEventCategory;
  fatalities: number | null;
  civilianImpact: boolean;
  confidence: EventConfidence;
  source: "gdelt";
  sourceUrl: string | null;
  sourceEventId: string;
  severity: EventSeverity;
  mentionCount: number;
  scope: EventScope;
  plotVisibility: PlotVisibility;
};

export type ConflictEventFeed = {
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  source: "gdelt";
  schemaVersion: 1;
  events: ConflictEvent[];
};
