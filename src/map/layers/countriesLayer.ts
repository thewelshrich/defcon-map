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

export function createCountriesLayer({
  data,
  hoveredCountryCode,
  onHoverCountry,
  onSelectCountry
}: CountriesLayerOptions) {
  return new GeoJsonLayer({
    id: "countries-layer",
    data,
    pickable: true,
    stroked: true,
    filled: true,
    getFillColor: [10, 10, 10, 255] satisfies RgbaColor,
    getLineColor: (feature): RgbaColor =>
      readCountryCode(feature) === hoveredCountryCode ? [255, 255, 255, 255] : [0, 255, 255, 220],
    getLineWidth: (feature) => (readCountryCode(feature) === hoveredCountryCode ? 3 : 1.2),
    lineWidthMinPixels: 1,
    onHover: ({ object }) => onHoverCountry(readCountryCode(object)),
    onClick: ({ object }) => onSelectCountry(readCountryCode(object)),
    updateTriggers: {
      getLineColor: [hoveredCountryCode],
      getLineWidth: [hoveredCountryCode]
    }
  });
}
