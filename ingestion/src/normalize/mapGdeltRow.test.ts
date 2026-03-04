import { describe, expect, it } from "vitest";

import { mapGdeltRow } from "./mapGdeltRow";
import type { ExtractedGdeltRow } from "../types";

const baseRow: ExtractedGdeltRow = {
  GLOBALEVENTID: "12345",
  SQLDATE: "20260304",
  DATEADDED: "20260304132819",
  EventCode: "190",
  EventRootCode: "19",
  EventBaseCode: "190",
  QuadClass: 4,
  GoldsteinScale: -7,
  NumMentions: 32,
  Actor1CountryCode: "RUS",
  Actor2CountryCode: "UKR",
  Actor1Name: "Russia",
  Actor2Name: "Ukraine",
  ActionGeo_CountryCode: "UKR",
  ActionGeo_Type: 4,
  ActionGeo_FullName: "Kyiv, Ukraine",
  ActionGeo_Lat: 50.4501,
  ActionGeo_Long: 30.5234,
  SOURCEURL: "https://example.com/story"
};

describe("mapGdeltRow", () => {
  it("maps supported GDELT conflict rows into normalized candidates", () => {
    expect(mapGdeltRow(baseRow)).toMatchObject({
      id: "gdelt:12345",
      source: "gdelt",
      sourceUrl: "https://example.com/story",
      sourceEventId: "12345",
      countryCode: "UKR",
      countryName: "Ukraine",
      actor1Name: "Russia",
      actor1CountryCode: "RUS",
      actor2Name: "Ukraine",
      actor2CountryCode: "UKR",
      occurredAt: "2026-03-04T13:28:19.000Z",
      category: "explosion",
      severity: "medium",
      confidence: "medium",
      fatalities: null,
      scope: "geopolitical",
      plotVisibility: "plot"
    });
  });

  it("rejects rows with invalid coordinates", () => {
    expect(
      mapGdeltRow({
        ...baseRow,
        ActionGeo_Lat: 120
      })
    ).toBeNull();
  });

  it("rejects unsupported event codes", () => {
    expect(
      mapGdeltRow({
        ...baseRow,
        EventCode: "160",
        EventRootCode: "16",
        EventBaseCode: "160"
      })
    ).toBeNull();
  });

  it("accepts numeric SQLDATE values returned by BigQuery", () => {
    expect(
      mapGdeltRow({
        ...baseRow,
        DATEADDED: null,
        SQLDATE: 20260304 as never
      })
    ).toMatchObject({
      occurredAt: "2026-03-04T00:00:00.000Z"
    });
  });

  it("accepts numeric DATEADDED values returned by BigQuery and uses them over SQLDATE", () => {
    expect(
      mapGdeltRow({
        ...baseRow,
        DATEADDED: 20260304153045 as never
      })
    ).toMatchObject({
      occurredAt: "2026-03-04T15:30:45.000Z"
    });
  });

  it("rejects rows whose event geography cannot be resolved from ActionGeo_CountryCode", () => {
    expect(
      mapGdeltRow({
        ...baseRow,
        ActionGeo_CountryCode: "ZZ"
      })
    ).toBeNull();
  });

  it("hides domestic-looking incidents instead of plotting them", () => {
    expect(
      mapGdeltRow({
        ...baseRow,
        GLOBALEVENTID: "67890",
        EventCode: "190",
        EventRootCode: "19",
        EventBaseCode: "190",
        Actor1CountryCode: null,
        Actor2CountryCode: null,
        Actor1Name: null,
        Actor2Name: null,
        ActionGeo_CountryCode: "US",
        ActionGeo_Type: 3,
        ActionGeo_FullName: "Arlington, Texas, United States",
        ActionGeo_Lat: 32.7357,
        ActionGeo_Long: -97.1081,
        SOURCEURL:
          "https://www.wfaa.com/article/news/local/arlington-texas-apartment-fire-two-alarm-officials-say/287-cd16d9b0-5f38-4833-b23c-93d15a3c5c35"
      })
    ).toMatchObject({
      scope: "infrastructure",
      plotVisibility: "hide"
    });
  });

  it("downgrades country-coordinate mismatches to low confidence and hides them", () => {
    expect(
      mapGdeltRow({
        ...baseRow,
        ActionGeo_CountryCode: "IR",
        ActionGeo_FullName: "Iran",
        ActionGeo_Lat: 39.828175,
        ActionGeo_Long: -98.5795
      })
    ).toMatchObject({
      confidence: "low",
      plotVisibility: "hide"
    });
  });
});
