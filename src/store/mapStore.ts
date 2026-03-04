import { create } from "zustand";
import { createStore } from "zustand/vanilla";

import type { MapViewportState } from "../domain/map";

type MapStoreState = {
  viewport: MapViewportState;
  setViewport: (viewport: MapViewportState) => void;
};

export const initialViewState: MapViewportState = {
  longitude: 20,
  latitude: 20,
  zoom: 1.4,
  bearing: 0,
  pitch: 0
};

function clampViewport(viewport: MapViewportState): MapViewportState {
  const visibleHalfWidth = 180 / 2 ** viewport.zoom;
  const maxLongitude = Math.max(0, 180 - visibleHalfWidth);

  return {
    ...viewport,
    longitude: Math.max(-maxLongitude, Math.min(maxLongitude, viewport.longitude)),
    latitude: Math.max(-70, Math.min(80, viewport.latitude))
  };
}

export function createMapStore() {
  return createStore<MapStoreState>((set) => ({
    viewport: initialViewState,
    setViewport: (viewport) => set({ viewport: clampViewport(viewport) })
  }));
}

export const useMapStore = create<MapStoreState>((set) => ({
  viewport: initialViewState,
  setViewport: (viewport) => set({ viewport: clampViewport(viewport) })
}));
