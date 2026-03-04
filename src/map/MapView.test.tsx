import { act, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

let deckGlProps: Record<string, unknown> | null = null;

vi.mock("@deck.gl/react", () => ({
  __esModule: true,
  default: ({ children, ...props }: { children?: ReactNode }) => {
    deckGlProps = props;
    return <div data-testid="deck-gl">{children}</div>;
  }
}));

import { MapView } from "./MapView";
import { useAppStore } from "../store/appStore";

describe("MapView", () => {
  afterEach(() => {
    act(() => {
      useAppStore.setState({ hoveredCountryCode: null });
    });
    deckGlProps = null;
  });

  it("mounts the map shell without crashing", () => {
    render(<MapView events={[]} />);

    expect(screen.getByTestId("deck-gl")).toBeInTheDocument();
  });

  it("shows a hover label on the map surface for the active country", () => {
    act(() => {
      useAppStore.setState({ hoveredCountryCode: "USA" });
    });

    render(<MapView events={[]} />);

    expect(screen.getByText("United States")).toBeInTheDocument();
  });

  it("disables deck.gl longitude normalization for the controlled viewport", () => {
    render(<MapView events={[]} />);

    expect(deckGlProps).toMatchObject({
      viewState: expect.objectContaining({
        normalize: false
      })
    });
  });
});
