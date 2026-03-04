import type { EventConfidence } from "../../../src/domain/events";

export function scoreConfidence(args: {
  hasValidGeo: boolean;
  hasValidCountry: boolean;
  coordinatesMatchCountry: boolean;
  hasActorCountries: boolean;
  mentionCount: number;
}): EventConfidence {
  const { hasValidGeo, hasValidCountry, coordinatesMatchCountry, hasActorCountries, mentionCount } = args;

  if (!coordinatesMatchCountry) {
    return "low";
  }

  if (hasValidGeo && hasValidCountry && hasActorCountries && mentionCount >= 40) {
    return "high";
  }

  if (hasValidGeo && hasValidCountry && mentionCount >= 15) {
    return "medium";
  }

  return "low";
}
