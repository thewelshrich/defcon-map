import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DefconSummary } from "../../domain/defcon";
import type { ConflictEvent } from "../../domain/events";
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
    latitude: 38.9072,
    longitude: -77.0369,
    category: "strategic",
    fatalities: 0,
    civilianImpact: false,
    confidence: "high"
  }
];

describe("AppShell", () => {
  it("renders the major shell regions", () => {
    render(<AppShell events={events} summary={summary} tickerItems={["Line 1", "Line 2"]} />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("complementary")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByTestId("map-view")).toBeInTheDocument();
  });
});
