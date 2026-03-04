import DeckGL from "@deck.gl/react";

import { worldCountries } from "../data/geometry/world";
import type { ConflictEvent } from "../domain/events";
import type { MapViewportState } from "../domain/map";
import { useAppStore } from "../store/appStore";
import { useMapStore } from "../store/mapStore";
import { createCountriesLayer } from "./layers/countriesLayer";
import { createEventsLayer } from "./layers/eventsLayer";

type MapViewProps = {
  events: ConflictEvent[];
};

export function MapView({ events }: MapViewProps) {
  const hoveredCountryCode = useAppStore((state) => state.hoveredCountryCode);
  const setHoveredCountryCode = useAppStore((state) => state.setHoveredCountryCode);
  const setSelectedCountryCode = useAppStore((state) => state.setSelectedCountryCode);
  const viewport = useMapStore((state) => state.viewport);
  const setViewport = useMapStore((state) => state.setViewport);
  const hoveredCountryName =
    worldCountries.features.find((feature) => feature.properties.code === hoveredCountryCode)?.properties.name ??
    null;

  const layers = [
    createCountriesLayer({
      data: worldCountries,
      hoveredCountryCode,
      onHoverCountry: setHoveredCountryCode,
      onSelectCountry: setSelectedCountryCode
    }),
    createEventsLayer(events)
  ];

  return (
    <div className="map-view">
      <DeckGL
        controller
        layers={layers}
        viewState={viewport}
        onViewStateChange={({ viewState }) => {
          const nextView = viewState as MapViewportState;

          setViewport({
            longitude: nextView.longitude,
            latitude: nextView.latitude,
            zoom: nextView.zoom,
            bearing: nextView.bearing ?? 0,
            pitch: nextView.pitch ?? 0
          });
        }}
      />
      {hoveredCountryName ? <div className="map-hover-label">{hoveredCountryName}</div> : null}
      <div className="map-overlay-grid" aria-hidden="true" />
    </div>
  );
}
