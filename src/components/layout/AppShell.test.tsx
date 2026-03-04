import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DefconSummary } from "../../domain/defcon";
import type { ConflictEvent } from "../../domain/events";
import type { TickerItem } from "../../app/App";
import { vi } from "vitest";

vi.mock("../../map/MapView", () => ({
  MapView: () => <div data-testid="map-view" />
}));

import { AppShell } from "./AppShell";

const summary: DefconSummary = {
  level: 3,
  score: 42,
  trend: "steady",
  updatedAt: "2026-03-04T12:00:00.000Z"
};

const events: ConflictEvent[] = [
  {
    id: "evt-1",
    occurredAt: "2026-03-04T12:00:00.000Z",
    countryCode: "USA",
    countryName: "United States",
    locationName: "Washington",
    actor1Name: "United States",
    actor1CountryCode: "USA",
    actor2Name: "Iran",
    actor2CountryCode: "IRN",
    latitude: 38.9072,
    longitude: -77.0369,
    category: "strategic",
    fatalities: 0,
    civilianImpact: false,
    confidence: "high",
    source: "gdelt",
    sourceUrl: "https://example.com/evt-1",
    sourceEventId: "evt-1",
    severity: "medium",
    mentionCount: 18,
    scope: "geopolitical",
    plotVisibility: "plot"
  }
];

const tickerItems: TickerItem[] = [
  { id: "t-1", category: "strategic", text: "STRATEGIC — United States (0 reported fatalities)" }
];

describe("AppShell", () => {
  it("renders the major shell regions", () => {
    render(<AppShell events={events} summary={summary} tickerItems={tickerItems} />);

    expect(screen.getByRole("complementary")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByTestId("map-view")).toBeInTheDocument();
  });
});
