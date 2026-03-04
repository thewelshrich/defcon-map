import { worldCountries } from "../../../src/data/geometry/world";

const countryCodeByName = new Map(
  worldCountries.features
    .map((feature) => feature.properties)
    .filter((properties): properties is { code: string; name: string } => Boolean(properties?.code && properties?.name))
    .map((properties) => [properties.name.toLowerCase(), properties.code] as const)
);

export function validateEventConsistency(args: {
  countryCode: string;
  locationName: string | null;
}) {
  const { countryCode, locationName } = args;

  if (!locationName) {
    return true;
  }

  const referencedCountryCode = countryCodeByName.get(locationName.trim().toLowerCase());

  if (!referencedCountryCode) {
    return true;
  }

  return referencedCountryCode === countryCode;
}
