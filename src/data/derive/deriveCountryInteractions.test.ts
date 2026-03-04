import { describe, expect, it } from "vitest";

import type { ConflictEvent } from "../../domain/events";
import { deriveCountryInteractions } from "./deriveCountryInteractions";

function makeEvent(overrides: Partial<ConflictEvent>): ConflictEvent {
  return {
    id: "evt-1",
    occurredAt: "2026-03-04T12:00:00.000Z",
    countryCode: "IRN",
    countryName: "Iran",
    locationName: "Tehran",
    actor1Name: "Israel",
    actor1CountryCode: "ISR",
    actor2Name: "Iran",
    actor2CountryCode: "IRN",
    latitude: 35.75,
    longitude: 51.5148,
    category: "explosion",
    fatalities: null,
    civilianImpact: false,
    confidence: "high",
    source: "gdelt",
    sourceUrl: "https://example.com/story",
    sourceEventId: "evt-1",
    severity: "critical",
    mentionCount: 24,
    scope: "geopolitical",
    plotVisibility: "plot",
    ...overrides
  };
}

describe("deriveCountryInteractions", () => {
  it("filters to cross-border geopolitical plotted events with both actor country codes", () => {
    const interactions = deriveCountryInteractions([
      makeEvent({ id: "keep-1" }),
      makeEvent({ id: "hide-1", plotVisibility: "hide" }),
      makeEvent({ id: "domestic-1", scope: "domestic" }),
      makeEvent({ id: "same-country-1", actor2CountryCode: "ISR", actor2Name: "Israel" }),
      makeEvent({ id: "missing-1", actor2CountryCode: null, actor2Name: null })
    ]);

    expect(interactions).toHaveLength(1);
    expect(interactions[0]).toMatchObject({
      fromCountryCode: "ISR",
      toCountryCode: "IRN"
    });
  });

  it("aggregates directional pairs and keeps direction separate", () => {
    const interactions = deriveCountryInteractions([
      makeEvent({ id: "a", sourceEventId: "a", severity: "critical", category: "explosion" }),
      makeEvent({
        id: "b",
        sourceEventId: "b",
        occurredAt: "2026-03-04T13:00:00.000Z",
        severity: "high",
        category: "battle"
      }),
      makeEvent({
        id: "c",
        sourceEventId: "c",
        actor1CountryCode: "IRN",
        actor1Name: "Iran",
        actor2CountryCode: "ISR",
        actor2Name: "Israel",
        countryCode: "ISR",
        countryName: "Israel",
        locationName: "Tel Aviv",
        latitude: 32.08,
        longitude: 34.78,
        severity: "medium",
        category: "battle"
      })
    ]);

    expect(interactions).toHaveLength(2);
    expect(interactions[0]).toMatchObject({
      id: "ISR->IRN",
      eventCount: 2,
      weightedSeverity: 7,
      dominantCategory: "battle",
      latestOccurredAt: "2026-03-04T13:00:00.000Z"
    });
    expect(interactions[1]).toMatchObject({
      id: "IRN->ISR",
      eventCount: 1,
      weightedSeverity: 2
    });
  });

  it("drops interactions when country centroids cannot be resolved", () => {
    const interactions = deriveCountryInteractions([
      makeEvent({
        actor1CountryCode: "WST",
        actor1Name: "NATO"
      })
    ]);

    expect(interactions).toHaveLength(0);
  });
});
