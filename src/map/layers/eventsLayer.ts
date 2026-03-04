import { ScatterplotLayer } from "@deck.gl/layers";

import type { ConflictEvent } from "../../domain/events";

type RgbaColor = [number, number, number, number];

function getColorByCategory(category: ConflictEvent["category"]) {
  switch (category) {
    case "battle":
      return [255, 64, 64, 220];
    case "explosion":
      return [255, 150, 0, 220];
    case "protest":
      return [255, 214, 10, 220];
    case "civilian":
      return [160, 0, 0, 220];
    case "strategic":
      return [80, 180, 255, 220];
    default:
      return [0, 255, 255, 220];
  }
}

export function createEventsLayer(events: ConflictEvent[]) {
  return new ScatterplotLayer<ConflictEvent>({
    id: "events-layer",
    data: events,
    pickable: false,
    stroked: true,
    filled: true,
    radiusMinPixels: 4,
    radiusMaxPixels: 12,
    getPosition: (event) => [event.longitude, event.latitude],
    getRadius: (event) => {
      const fatalities = event.fatalities ?? 0;

      return Math.max(35000, fatalities * 8000);
    },
    getFillColor: (event): RgbaColor => getColorByCategory(event.category) as RgbaColor,
    getLineColor: [255, 255, 255, 180] satisfies RgbaColor,
    lineWidthMinPixels: 1
  });
}
