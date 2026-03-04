import { describe, expect, it } from "vitest";

import type { CountryInteraction } from "../../domain/interactions";
import { createInteractionLayer } from "./interactionsLayer";

const interaction: CountryInteraction = {
  id: "ISR->IRN",
  fromCountryCode: "ISR",
  toCountryCode: "IRN",
  fromCountryName: "Israel",
  toCountryName: "Iran",
  fromLongitude: 35.15,
  fromLatitude: 31.25,
  toLongitude: 53,
  toLatitude: 32,
  eventCount: 3,
  weightedSeverity: 8,
  dominantCategory: "explosion",
  latestOccurredAt: "2026-03-04T12:00:00.000Z"
};

describe("createInteractionLayer", () => {
  it("creates an arc layer with the expected id and data", () => {
    const layer = createInteractionLayer({
      interactions: [interaction],
      selectedCountryCode: null
    });

    expect(layer.id).toBe("country-interactions-layer");
    expect(layer.props.data).toEqual([interaction]);
  });

  it("dims unrelated arcs when a country is selected", () => {
    const layer = createInteractionLayer({
      interactions: [interaction],
      selectedCountryCode: "USA"
    });

    const getSourceColor = layer.props.getSourceColor as (candidate: CountryInteraction) => [number, number, number, number];

    expect(getSourceColor(interaction)).toEqual([255, 180, 60, 30]);
  });
});
