export type ConflictEventCategory =
  | "battle"
  | "explosion"
  | "protest"
  | "civilian"
  | "strategic";

export type EventConfidence = "high" | "medium" | "low";

export type ConflictEvent = {
  id: string;
  occurredAt: string;
  countryCode: string;
  countryName: string;
  locationName: string | null;
  latitude: number;
  longitude: number;
  category: ConflictEventCategory;
  fatalities: number | null;
  civilianImpact: boolean;
  confidence: EventConfidence;
};
