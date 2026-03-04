import { afterEach, describe, expect, it, vi } from "vitest";

import { getSummaryQueryOptions, fetchDefconSummary } from "./summary";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchDefconSummary", () => {
  it("returns the mocked DEFCON summary", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          level: 3,
          score: 42,
          trend: "up",
          updatedAt: "2026-03-04T09:30:00.000Z",
          generatedAt: "2026-03-04T09:30:00.000Z",
          windowStart: "2026-02-26T09:30:00.000Z",
          windowEnd: "2026-03-04T09:30:00.000Z",
          source: "gdelt",
          schemaVersion: 1,
          eventCount: 12,
          countryCount: 4
        })
      })
    );

    await expect(fetchDefconSummary()).resolves.toMatchObject({
      level: 3,
      trend: "up",
      source: "gdelt"
    });
  });
});

describe("getSummaryQueryOptions", () => {
  it("exposes a stable query key for the global summary", () => {
    expect(getSummaryQueryOptions().queryKey).toEqual(["defcon-summary"]);
  });
});
