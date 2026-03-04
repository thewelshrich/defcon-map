import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchConflictEvents, getEventsQueryOptions } from "./events";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchConflictEvents", () => {
  it("returns the conflict event feed envelope from the API endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          generatedAt: "2026-03-04T12:00:00.000Z",
          windowStart: "2026-02-26T12:00:00.000Z",
          windowEnd: "2026-03-04T12:00:00.000Z",
          source: "gdelt",
          schemaVersion: 1,
          events: [
            {
              id: "evt-1",
              countryCode: "USA"
            }
          ]
        })
      })
    );

    await expect(fetchConflictEvents()).resolves.toMatchObject({
      source: "gdelt",
      events: [
        {
          id: "evt-1",
          countryCode: "USA"
        }
      ]
    });
  });
});

describe("getEventsQueryOptions", () => {
  it("exposes a stable query key for events", () => {
    expect(getEventsQueryOptions().queryKey).toEqual(["conflict-events"]);
  });
});
