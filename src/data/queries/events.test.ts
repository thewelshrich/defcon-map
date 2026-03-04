import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchConflictEvents, getEventsQueryOptions } from "./events";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchConflictEvents", () => {
  it("returns conflict events from the API endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [
          {
            id: "evt-1",
            countryCode: "USA"
          }
        ]
      })
    );

    await expect(fetchConflictEvents()).resolves.toMatchObject([
      {
        id: "evt-1",
        countryCode: "USA"
      }
    ]);
  });
});

describe("getEventsQueryOptions", () => {
  it("exposes a stable query key for events", () => {
    expect(getEventsQueryOptions().queryKey).toEqual(["conflict-events"]);
  });
});
