import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useAppStore } from "../../store/appStore";
import { SidePanel } from "./SidePanel";

describe("SidePanel", () => {
  afterEach(() => {
    act(() => {
      useAppStore.setState({
        hoveredCountryCode: null,
        selectedCountryCode: null,
        selectedEventId: null,
        filters: useAppStore.getState().filters
      });
    });
  });

  it("shows real country names when a country is selected", () => {
    act(() => {
      useAppStore.setState({
        hoveredCountryCode: "USA",
        selectedCountryCode: "USA"
      });
    });

    render(<SidePanel />);

    expect(screen.getByText("Hover target: United States")).toBeInTheDocument();
    expect(screen.getByText("Selected: United States")).toBeInTheDocument();
  });
});
