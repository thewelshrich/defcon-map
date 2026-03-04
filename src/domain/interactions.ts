import type { ConflictEventCategory } from "./events";

export type CountryInteraction = {
  id: string;
  fromCountryCode: string;
  toCountryCode: string;
  fromCountryName: string;
  toCountryName: string;
  fromLongitude: number;
  fromLatitude: number;
  toLongitude: number;
  toLatitude: number;
  eventCount: number;
  weightedSeverity: number;
  dominantCategory: ConflictEventCategory;
  latestOccurredAt: string;
};
