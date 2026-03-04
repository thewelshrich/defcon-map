import { describe, expect, it } from "vitest";

import { buildDefconSummary } from "./buildDefconSummary";
import type { PublishedConflictEvent } from "../types";

function makeEvent(
  id: string,
  severity: PublishedConflictEvent["severity"],
  countryCode: string,
  civilianImpact: boolean
): PublishedConflictEvent {
  return {
    id,
    occurredAt: "2026-03-04T10:00:00.000Z",
    countryCode,
    countryName: countryCode,
    locationName: null,
    actor1Name: null,
    actor1CountryCode: null,
    actor2Name: null,
    actor2CountryCode: null,
    latitude: 0,
    longitude: 0,
    category: civilianImpact ? "civilian" : "battle",
    fatalities: null,
    civilianImpact,
    confidence: "high",
    source: "gdelt",
    sourceUrl: "https://example.com/story",
    sourceEventId: id,
    severity,
    mentionCount: 50,
    scope: "geopolitical",
    plotVisibility: "plot"
  };
}

describe("buildDefconSummary", () => {
  it("computes a stable DEFCON snapshot with metadata", () => {
    const currentEvents = [
      makeEvent("1", "critical", "UKR", true),
      makeEvent("2", "high", "UKR", false),
      makeEvent("3", "high", "ISR", true)
    ];

    const previousEvents = [makeEvent("4", "medium", "UKR", false)];

    const summary = buildDefconSummary({
      currentEvents,
      previousEvents,
      generatedAt: "2026-03-04T12:00:00.000Z",
      windowStart: "2026-02-26T12:00:00.000Z",
      windowEnd: "2026-03-04T12:00:00.000Z"
    });

    expect(summary).toMatchObject({
      source: "gdelt",
      schemaVersion: 1,
      eventCount: 3,
      countryCount: 2,
      trend: "up"
    });
    expect(summary.level).toBeLessThanOrEqual(3);
  });
});
