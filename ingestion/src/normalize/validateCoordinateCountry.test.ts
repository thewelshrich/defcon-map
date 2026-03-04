import { describe, expect, it } from "vitest";

import { validateCoordinateCountry } from "./validateCoordinateCountry";

describe("validateCoordinateCountry", () => {
  it("accepts coordinates within the event country bounds", () => {
    expect(
      validateCoordinateCountry({
        countryCode: "IRN",
        latitude: 35.75,
        longitude: 51.5148
      })
    ).toBe(true);
  });

  it("rejects coordinates that are clearly outside the event country bounds", () => {
    expect(
      validateCoordinateCountry({
        countryCode: "IRN",
        latitude: 39.828175,
        longitude: -98.5795
      })
    ).toBe(false);
  });

  it("allows near-border coordinates using a small tolerance buffer", () => {
    expect(
      validateCoordinateCountry({
        countryCode: "QAT",
        latitude: 26.8,
        longitude: 51.2
      })
    ).toBe(true);
  });
});
