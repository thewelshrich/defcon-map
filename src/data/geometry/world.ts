import type { FeatureCollection, Geometry } from "geojson";

import countryData from "./world-countries.geo.json";

type CountryProperties = {
  code: string;
  name: string;
};

export const worldCountries = countryData as FeatureCollection<Geometry, CountryProperties>;

const metadataByAlpha3Code = new Map<string, CountryProperties>();
const metadataByNumericCode = new Map<string, CountryProperties>();

for (const feature of worldCountries.features) {
  const metadata = feature.properties;

  if (!metadata?.code || !metadata?.name) {
    continue;
  }

  metadataByAlpha3Code.set(metadata.code, metadata);

  if (feature.id != null) {
    metadataByNumericCode.set(String(feature.id), metadata);
  }
}

export function getCountryMetadata(identifier: string) {
  return metadataByNumericCode.get(identifier) ?? metadataByAlpha3Code.get(identifier) ?? null;
}
