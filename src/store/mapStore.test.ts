import { describe, expect, it } from "vitest";

import { createMapStore, initialViewState } from "./mapStore";

describe("createMapStore", () => {
  it("starts with a world-focused default viewport", () => {
    expect(initialViewState).toMatchObject({
      longitude: 0,
      latitude: 18
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
});
