import { useCallback, useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";

import { worldCountries } from "../data/geometry/world";
import type { ConflictEvent } from "../domain/events";
import type { MapViewportState } from "../domain/map";
import { useAppStore } from "../store/appStore";
import { useMapStore } from "../store/mapStore";
import { createCountriesLayers } from "./layers/countriesLayer";
import { createEventsLayers } from "./layers/eventsLayer";

type MapViewProps = {
  events: ConflictEvent[];
};

type ControlledDeckViewState = MapViewportState & {
  minZoom: number;
  maxZoom: number;
  normalize: boolean;
};

export function MapView({ events }: MapViewProps) {
  const hoveredCountryCode = useAppStore((state) => state.hoveredCountryCode);
  const setHoveredCountryCode = useAppStore((state) => state.setHoveredCountryCode);
  const setSelectedCountryCode = useAppStore((state) => state.setSelectedCountryCode);
  const viewport = useMapStore((state) => state.viewport);
  const setViewport = useMapStore((state) => state.setViewport);

  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setPulsePhase(Date.now() * 0.003);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const hoveredCountryName =
    worldCountries.features.find((feature) => feature.properties.code === hoveredCountryCode)?.properties.name ??
    null;

  const countriesLayers = createCountriesLayers({
    data: worldCountries,
    hoveredCountryCode,
    onHoverCountry: setHoveredCountryCode,
    onSelectCountry: setSelectedCountryCode
  });

  const eventsLayers = createEventsLayers(events, pulsePhase);

  const layers = [...countriesLayers, ...eventsLayers];
  const controlledViewState: ControlledDeckViewState = {
    ...viewport,
    minZoom: 2,
    maxZoom: 4,
    normalize: false
  };

  const handleViewStateChange = useCallback(
    ({ viewState }: { viewState: unknown }) => {
      const nextView = viewState as MapViewportState;
      setViewport({
        longitude: nextView.longitude,
        latitude: nextView.latitude,
        zoom: nextView.zoom,
        bearing: nextView.bearing ?? 0,
        pitch: nextView.pitch ?? 0
      });
    },
    [setViewport]
  );

  return (
    <div className="map-view">
      <DeckGL
        controller
        layers={layers}
        viewState={controlledViewState}
        onViewStateChange={handleViewStateChange}
      />
      {hoveredCountryName ? <div className="map-hover-label">{hoveredCountryName}</div> : null}
      <div className="map-overlay-grid" aria-hidden="true" />
    </div>
  );
}
