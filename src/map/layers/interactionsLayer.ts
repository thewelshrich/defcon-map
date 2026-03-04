import { ArcLayer } from "@deck.gl/layers";

import type { CountryInteraction } from "../../domain/interactions";

type RgbaColor = [number, number, number, number];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getCategoryColor(category: CountryInteraction["dominantCategory"], alpha: number): RgbaColor {
  switch (category) {
    case "battle":
      return [255, 64, 64, alpha];
    case "explosion":
      return [255, 180, 60, alpha];
    case "civilian":
      return [200, 30, 30, alpha];
    case "strategic":
      return [80, 180, 255, alpha];
    case "protest":
      return [255, 214, 10, alpha];
    default:
      return [0, 255, 255, alpha];
  }
}

function isConnected(interaction: CountryInteraction, selectedCountryCode: string | null) {
  if (!selectedCountryCode) {
    return true;
  }

  return (
    interaction.fromCountryCode === selectedCountryCode ||
    interaction.toCountryCode === selectedCountryCode
  );
}

export function createInteractionLayer(args: {
  interactions: CountryInteraction[];
  selectedCountryCode: string | null;
}) {
  const { interactions, selectedCountryCode } = args;

  return new ArcLayer<CountryInteraction>({
    id: "country-interactions-layer",
    data: interactions,
    pickable: false,
    getSourcePosition: (interaction) => [interaction.fromLongitude, interaction.fromLatitude],
    getTargetPosition: (interaction) => [interaction.toLongitude, interaction.toLatitude],
    getWidth: (interaction) => clamp(2 + interaction.weightedSeverity * 0.5, 2, 10),
    getSourceColor: (interaction): RgbaColor =>
      getCategoryColor(interaction.dominantCategory, isConnected(interaction, selectedCountryCode) ? 90 : 30),
    getTargetColor: (interaction): RgbaColor =>
      getCategoryColor(interaction.dominantCategory, isConnected(interaction, selectedCountryCode) ? 150 : 45)
  });
}
