import { describe, expect, it } from "vitest";

import { dedupeEvents, dedupeIncidentEvents } from "./dedupeEvents";
import type { NormalizedConflictCandidate } from "../types";

const olderHighConfidence: NormalizedConflictCandidate = {
  id: "gdelt:1",
  occurredAt: "2026-03-04T08:00:00.000Z",
  countryCode: "UKR",
  countryName: "Ukraine",
  locationName: "Kyiv",
  actor1Name: "Russia",
  actor1CountryCode: "RUS",
  actor2Name: "Ukraine",
  actor2CountryCode: "UKR",
  latitude: 50.4501,
  longitude: 30.5234,
  category: "explosion",
  fatalities: null,
  civilianImpact: false,
  confidence: "high",
  source: "gdelt",
  sourceUrl: "https://example.com/story",
  sourceEventId: "1",
  severity: "high",
  mentionCount: 50,
  scope: "geopolitical",
  plotVisibility: "plot",
  rawCountryCode: "UKR",
  geoPrecision: "city",
  dedupeKey: "https://example.com/story|explosion|UKR|50.45|30.52|2026-03-04T08:00"
};

describe("dedupeEvents", () => {
  it("keeps the best event per dedupe key by confidence, mentions, and recency", () => {
    const weakerButNewer: NormalizedConflictCandidate = {
      ...olderHighConfidence,
      id: "gdelt:2",
      sourceEventId: "2",
      occurredAt: "2026-03-04T09:00:00.000Z",
      confidence: "medium",
      mentionCount: 70
    };

    const duplicateStronger: NormalizedConflictCandidate = {
      ...olderHighConfidence,
      id: "gdelt:3",
      sourceEventId: "3",
      occurredAt: "2026-03-04T09:30:00.000Z",
      mentionCount: 60
    };

    const result = dedupeEvents([olderHighConfidence, weakerButNewer, duplicateStronger]);

    expect(result.dedupeCount).toBe(2);
    expect(result.events).toHaveLength(1);
    expect(result.events[0]).toMatchObject({
      id: "gdelt:3",
      sourceEventId: "3"
    });
  });

  it("collapses duplicate visible markers even when actor metadata differs", () => {
    const sameMarkerDifferentSourceId: NormalizedConflictCandidate = {
      ...olderHighConfidence,
      id: "gdelt:4",
      sourceEventId: "4",
      sourceUrl: "https://example.com/story?copy=1"
    };

    const result = dedupeEvents([olderHighConfidence, sameMarkerDifferentSourceId]);

    expect(result.dedupeCount).toBe(1);
    expect(result.events).toHaveLength(1);
  });

  it("collapses same incident reports across different source URLs in coarse pass", () => {
    const firstOutlet: NormalizedConflictCandidate = {
      ...olderHighConfidence,
      id: "gdelt:10",
      sourceEventId: "10",
      sourceUrl: "https://news-a.example.com/iran-strike",
      latitude: 35.741,
      longitude: 51.521,
      occurredAt: "2026-03-04T08:10:00.000Z",
      dedupeKey: "https://news-a.example.com/iran-strike|explosion|IRN|35.74|51.52|2026-03-04T08:00"
    };
    const secondOutlet: NormalizedConflictCandidate = {
      ...olderHighConfidence,
      id: "gdelt:11",
      sourceEventId: "11",
      sourceUrl: "https://news-b.example.com/iran-strike",
      actor1Name: "United States",
      actor1CountryCode: "USA",
      actor2Name: "Iran",
      actor2CountryCode: "IRN",
      latitude: 35.744,
      longitude: 51.524,
      occurredAt: "2026-03-04T09:40:00.000Z",
      dedupeKey: "https://news-b.example.com/iran-strike|explosion|IRN|35.74|51.52|2026-03-04T09:30"
    };
    const thirdOutlet: NormalizedConflictCandidate = {
      ...olderHighConfidence,
      id: "gdelt:12",
      sourceEventId: "12",
      sourceUrl: "https://news-c.example.com/iran-strike",
      actor1Name: "Turkey",
      actor1CountryCode: "TUR",
      actor2Name: "Iran",
      actor2CountryCode: "IRN",
      latitude: 35.748,
      longitude: 51.526,
      occurredAt: "2026-03-04T09:55:00.000Z",
      dedupeKey: "https://news-c.example.com/iran-strike|explosion|IRN|35.75|51.53|2026-03-04T09:30"
    };

    const fine = dedupeEvents([firstOutlet, secondOutlet, thirdOutlet]);
    const coarse = dedupeIncidentEvents(fine.events);

    expect(fine.events).toHaveLength(3);
    expect(coarse.events).toHaveLength(1);
    expect(coarse.dedupeCount).toBe(2);
  });
});
