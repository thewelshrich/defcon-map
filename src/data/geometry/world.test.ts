import { describe, expect, it } from "vitest";

import { getCountryMetadata, worldCountries } from "./world";

describe("worldCountries", () => {
  it("exposes a real world feature collection instead of placeholder blocks", () => {
    expect(worldCountries.type).toBe("FeatureCollection");
    expect(worldCountries.features.length).toBeGreaterThan(150);
  });

  it("resolves real country metadata for well-known ISO numeric ids", () => {
    expect(getCountryMetadata("840")).toEqual({
      code: "USA",
      name: "United States"
    });
  });
});
