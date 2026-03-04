import type { EventConfidence, PlotVisibility } from "../../../src/domain/events";

export function decidePlotVisibility(args: {
  scope: "geopolitical" | "domestic" | "infrastructure" | "policy";
  confidence: EventConfidence;
  passesSourceQuality: boolean;
}) : PlotVisibility {
  const { scope, confidence, passesSourceQuality } = args;

  if (!passesSourceQuality) {
    return "hide";
  }

  if (scope !== "geopolitical") {
    return "hide";
  }

  return confidence === "high" || confidence === "medium" ? "plot" : "hide";
}
