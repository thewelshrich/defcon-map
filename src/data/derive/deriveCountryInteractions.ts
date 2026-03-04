import { getCountryMetadata } from "../geometry/world";
import type { CountryInteraction } from "../../domain/interactions";
import type { ConflictEvent, ConflictEventCategory, EventSeverity } from "../../domain/events";
import { getCountryCentroid } from "../../map/geometry/countryCentroids";

type AggregatedInteraction = {
  fromCountryCode: string;
  toCountryCode: string;
  eventCount: number;
  weightedSeverity: number;
  latestOccurredAt: string;
  categoryCounts: Map<ConflictEventCategory, number>;
};

function severityWeight(severity: EventSeverity) {
  switch (severity) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
  }
}

function dominantCategory(categoryCounts: Map<ConflictEventCategory, number>): ConflictEventCategory {
  const tieBreakOrder: ConflictEventCategory[] = ["civilian", "battle", "explosion", "strategic", "protest"];
  let bestCategory: ConflictEventCategory = "strategic";
  let bestCount = -1;

  for (const category of tieBreakOrder) {
    const count = categoryCounts.get(category) ?? 0;

    if (count > bestCount) {
      bestCategory = category;
      bestCount = count;
    }
  }

  return bestCategory;
}

function includeEvent(event: ConflictEvent) {
  return (
    event.plotVisibility === "plot" &&
    event.scope === "geopolitical" &&
    event.actor1CountryCode != null &&
    event.actor2CountryCode != null &&
    event.actor1CountryCode !== event.actor2CountryCode
  );
}

export function deriveCountryInteractions(events: ConflictEvent[]): CountryInteraction[] {
  const groups = new Map<string, AggregatedInteraction>();

  for (const event of events) {
    if (!includeEvent(event)) {
      continue;
    }

    const fromCountryCode = event.actor1CountryCode!;
    const toCountryCode = event.actor2CountryCode!;
    const key = `${fromCountryCode}->${toCountryCode}`;
    const current = groups.get(key);

    if (!current) {
      groups.set(key, {
        fromCountryCode,
        toCountryCode,
        eventCount: 1,
        weightedSeverity: severityWeight(event.severity),
        latestOccurredAt: event.occurredAt,
        categoryCounts: new Map([[event.category, 1]])
      });
      continue;
    }

    current.eventCount += 1;
    current.weightedSeverity += severityWeight(event.severity);
    current.latestOccurredAt =
      current.latestOccurredAt > event.occurredAt ? current.latestOccurredAt : event.occurredAt;
    current.categoryCounts.set(event.category, (current.categoryCounts.get(event.category) ?? 0) + 1);
  }

  const interactions: CountryInteraction[] = [];

  for (const [id, group] of groups) {
    const fromCountry = getCountryMetadata(group.fromCountryCode);
    const toCountry = getCountryMetadata(group.toCountryCode);
    const fromCentroid = getCountryCentroid(group.fromCountryCode);
    const toCentroid = getCountryCentroid(group.toCountryCode);

    if (!fromCountry || !toCountry || !fromCentroid || !toCentroid) {
      continue;
    }

    interactions.push({
      id,
      fromCountryCode: group.fromCountryCode,
      toCountryCode: group.toCountryCode,
      fromCountryName: fromCountry.name,
      toCountryName: toCountry.name,
      fromLongitude: fromCentroid[0],
      fromLatitude: fromCentroid[1],
      toLongitude: toCentroid[0],
      toLatitude: toCentroid[1],
      eventCount: group.eventCount,
      weightedSeverity: group.weightedSeverity,
      dominantCategory: dominantCategory(group.categoryCounts),
      latestOccurredAt: group.latestOccurredAt
    });
  }

  return interactions.sort((left, right) => {
    if (right.weightedSeverity !== left.weightedSeverity) {
      return right.weightedSeverity - left.weightedSeverity;
    }

    if (right.eventCount !== left.eventCount) {
      return right.eventCount - left.eventCount;
    }

    return right.latestOccurredAt.localeCompare(left.latestOccurredAt);
  });
}
