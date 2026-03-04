import { ScatterplotLayer } from "@deck.gl/layers";

import type { ConflictEvent } from "../../domain/events";

type RgbaColor = [number, number, number, number];

function getCategoryColor(category: ConflictEvent["category"]): RgbaColor {
  switch (category) {
    case "battle":
      return [255, 64, 64, 255];
    case "explosion":
      return [255, 150, 0, 255];
    case "protest":
      return [255, 214, 10, 255];
    case "civilian":
      return [200, 30, 30, 255];
    case "strategic":
      return [80, 180, 255, 255];
    default:
      return [0, 255, 255, 255];
  }
}

function getGlowColor(category: ConflictEvent["category"]): RgbaColor {
  switch (category) {
    case "battle":
      return [255, 64, 64, 50];
    case "explosion":
      return [255, 180, 60, 50];
    case "protest":
      return [255, 214, 10, 35];
    case "civilian":
      return [200, 30, 30, 45];
    case "strategic":
      return [80, 180, 255, 35];
    default:
      return [0, 255, 255, 35];
  }
}

export function createEventsLayers(events: ConflictEvent[], pulsePhase: number) {
  const pulseScale = 1 + 0.3 * Math.sin(pulsePhase);

  const glowLayer = new ScatterplotLayer<ConflictEvent>({
    id: "events-glow-layer",
    data: events,
    pickable: false,
    stroked: false,
    filled: true,
    radiusMinPixels: 14,
    radiusMaxPixels: 50,
    getPosition: (event) => [event.longitude, event.latitude],
    getRadius: (event) => {
      const fatalities = event.fatalities ?? 0;
      return Math.max(80000, fatalities * 18000) * pulseScale;
    },
    getFillColor: (event): RgbaColor => getGlowColor(event.category),
    updateTriggers: {
      getRadius: [pulsePhase]
    }
  });

  const markerLayer = new ScatterplotLayer<ConflictEvent>({
    id: "events-marker-layer",
    data: events,
    pickable: true,
    stroked: true,
    filled: true,
    radiusMinPixels: 5,
    radiusMaxPixels: 16,
    getPosition: (event) => [event.longitude, event.latitude],
    getRadius: (event) => {
      const fatalities = event.fatalities ?? 0;
      return Math.max(40000, fatalities * 9000);
    },
    getFillColor: (event): RgbaColor => getCategoryColor(event.category),
    getLineColor: [255, 255, 255, 120] satisfies RgbaColor,
    lineWidthMinPixels: 1
  });

  return [glowLayer, markerLayer];
}
