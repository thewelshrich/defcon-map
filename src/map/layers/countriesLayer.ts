import { GeoJsonLayer } from "@deck.gl/layers";

type CountryFeatureProperties = {
  code: string;
  name: string;
};

type CountryCollection = GeoJSON.FeatureCollection<GeoJSON.Geometry, CountryFeatureProperties>;
type RgbaColor = [number, number, number, number];

type CountriesLayerOptions = {
  data: CountryCollection;
  hoveredCountryCode: string | null;
  onHoverCountry: (countryCode: string | null) => void;
  onSelectCountry: (countryCode: string | null) => void;
};

function readCountryCode(candidate: unknown) {
  if (
    candidate &&
    typeof candidate === "object" &&
    "properties" in candidate &&
    candidate.properties &&
    typeof candidate.properties === "object" &&
    "code" in candidate.properties &&
    typeof candidate.properties.code === "string"
  ) {
    return candidate.properties.code;
  }

  return null;
}

export function createCountriesLayers({
  data,
  hoveredCountryCode,
  onHoverCountry,
  onSelectCountry
}: CountriesLayerOptions) {
  const glowLayer = new GeoJsonLayer({
    id: "countries-glow-layer",
    data,
    pickable: false,
    stroked: true,
    filled: false,
    getLineColor: (feature): RgbaColor =>
      readCountryCode(feature) === hoveredCountryCode
        ? [0, 255, 255, 100]
        : [0, 255, 255, 40],
    getLineWidth: (feature) =>
      readCountryCode(feature) === hoveredCountryCode ? 6 : 3,
    lineWidthMinPixels: 2,
    lineWidthMaxPixels: 8,
    updateTriggers: {
      getLineColor: [hoveredCountryCode],
      getLineWidth: [hoveredCountryCode]
    }
  });

  const mainLayer = new GeoJsonLayer({
    id: "countries-layer",
    data,
    pickable: true,
    stroked: true,
    filled: true,
    getFillColor: [12, 20, 35, 240] satisfies RgbaColor,
    getLineColor: (feature): RgbaColor =>
      readCountryCode(feature) === hoveredCountryCode
        ? [150, 255, 255, 255]
        : [0, 255, 255, 180],
    getLineWidth: (feature) =>
      readCountryCode(feature) === hoveredCountryCode ? 2 : 0.8,
    lineWidthMinPixels: 1,
    onHover: ({ object }) => onHoverCountry(readCountryCode(object)),
    onClick: ({ object }) => onSelectCountry(readCountryCode(object)),
    updateTriggers: {
      getLineColor: [hoveredCountryCode],
      getLineWidth: [hoveredCountryCode]
    }
  });

  return [glowLayer, mainLayer];
}
