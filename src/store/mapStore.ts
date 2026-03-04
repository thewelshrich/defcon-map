import { create } from "zustand";
import { createStore } from "zustand/vanilla";

import type { MapViewportState } from "../domain/map";

type MapStoreState = {
  viewport: MapViewportState;
  setViewport: (viewport: MapViewportState) => void;
};

export const initialViewState: MapViewportState = {
  longitude: 0,
  latitude: 18,
  zoom: 0.8,
  bearing: 0,
  pitch: 0
};

export function createMapStore() {
  return createStore<MapStoreState>((set) => ({
    viewport: initialViewState,
    setViewport: (viewport) => set({ viewport })
  }));
}

export const useMapStore = create<MapStoreState>((set) => ({
  viewport: initialViewState,
  setViewport: (viewport) => set({ viewport })
}));
