import { describe, expect, it } from "vitest";

import { createMapStore, initialViewState } from "./mapStore";

describe("createMapStore", () => {
  it("starts with a world-focused default viewport", () => {
    expect(initialViewState).toMatchObject({
      longitude: 20,
      latitude: 20
    });
  });

  it("updates viewport state through the setter", () => {
    const store = createMapStore();

    store.getState().setViewport({
      ...initialViewState,
      zoom: 2.5
    });

    expect(store.getState().viewport.zoom).toBe(2.5);
  });

  it("clamps horizontal panning to the visible world width", () => {
    const store = createMapStore();

    store.getState().setViewport({
      ...initialViewState,
      longitude: 180,
      zoom: 2
    });

    expect(store.getState().viewport.longitude).toBe(135);
  });
});
