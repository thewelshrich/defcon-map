import { describe, expect, it } from "vitest";

import { resolveGdeltGeography } from "./resolveGdeltGeography";

describe("resolveGdeltGeography", () => {
  it("resolves alpha-2 GDELT geo country codes into canonical alpha-3 metadata", () => {
    expect(
      resolveGdeltGeography({
        actionGeoCountryCode: "IR",
        actionGeoType: 1
      })
    ).toEqual({
      countryCode: "IRN",
      countryName: "Iran",
      geoPrecision: "country",
      rawCountryCode: "IR"
    });
  });

  it("passes through supported alpha-3 geo country codes", () => {
    expect(
      resolveGdeltGeography({
        actionGeoCountryCode: "UKR",
        actionGeoType: 4
      })
    ).toEqual({
      countryCode: "UKR",
      countryName: "Ukraine",
      geoPrecision: "city",
      rawCountryCode: "UKR"
    });
  });

  it("resolves known FIPS country codes before ISO alpha-2 fallback", () => {
    expect(
      resolveGdeltGeography({
        actionGeoCountryCode: "RS",
        actionGeoType: 4
      })
    ).toEqual({
      countryCode: "RUS",
      countryName: "Russia",
      geoPrecision: "city",
      rawCountryCode: "RS"
    });

    expect(
      resolveGdeltGeography({
        actionGeoCountryCode: "UP",
        actionGeoType: 4
      })
    ).toEqual({
      countryCode: "UKR",
      countryName: "Ukraine",
      geoPrecision: "city",
      rawCountryCode: "UP"
    });
  });

  it("continues to resolve ISO alpha-2 codes when no FIPS override exists", () => {
    expect(
      resolveGdeltGeography({
        actionGeoCountryCode: "QA",
        actionGeoType: 1
      })
    ).toEqual({
      countryCode: "QAT",
      countryName: "Qatar",
      geoPrecision: "country",
      rawCountryCode: "QA"
    });
  });

  it("maps UK FIPS code to Great Britain", () => {
    expect(
      resolveGdeltGeography({
        actionGeoCountryCode: "UK",
        actionGeoType: 2
      })
    ).toEqual({
      countryCode: "GBR",
      countryName: "United Kingdom",
      geoPrecision: "subnational",
      rawCountryCode: "UK"
    });
  });

  it("rejects unresolved geo country codes instead of guessing from actors", () => {
    expect(
      resolveGdeltGeography({
        actionGeoCountryCode: "ZZ",
        actionGeoType: 4
      })
    ).toBeNull();
  });
});
