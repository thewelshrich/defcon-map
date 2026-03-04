import type { DefconLevel, DefconSummarySnapshot, DefconTrend } from "../../../src/domain/defcon";
import type { PublishedConflictEvent } from "../types";

function severityWeight(severity: PublishedConflictEvent["severity"]) {
  switch (severity) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function scoreLevel(score: number): DefconLevel {
  if (score >= 80) {
    return 1;
  }
  if (score >= 65) {
    return 2;
  }
  if (score >= 45) {
    return 3;
  }
  if (score >= 25) {
    return 4;
  }
  return 5;
}

function scoreTrend(currentWeighted: number, previousWeighted: number): DefconTrend {
  if (previousWeighted === 0) {
    return currentWeighted > 0 ? "up" : "steady";
  }

  const ratio = (currentWeighted - previousWeighted) / previousWeighted;

  if (ratio >= 0.1) {
    return "up";
  }

  if (ratio <= -0.1) {
    return "down";
  }

  return "steady";
}

export function buildDefconSummary(args: {
  currentEvents: PublishedConflictEvent[];
  previousEvents: PublishedConflictEvent[];
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
}): DefconSummarySnapshot {
  const { currentEvents, previousEvents, generatedAt, windowStart, windowEnd } = args;
  const currentWeighted = currentEvents.reduce((total, event) => total + severityWeight(event.severity), 0);
  const previousWeighted = previousEvents.reduce((total, event) => total + severityWeight(event.severity), 0);
  const countryCount = new Set(currentEvents.map((event) => event.countryCode)).size;
  const civilianCount = currentEvents.filter((event) => event.civilianImpact).length;

  const intensityScore =
    currentEvents.length === 0 ? 0 : clamp((currentWeighted / (currentEvents.length * 4)) * 100, 0, 100);
  const diffusionScore = clamp((countryCount / 25) * 100, 0, 100);
  const civilianShare = currentEvents.length === 0 ? 0 : civilianCount / currentEvents.length;
  const civilianScore = clamp((civilianShare * 70 + Math.min(civilianCount / 10, 1) * 30) * 100, 0, 100);
  const accelerationScore =
    previousWeighted === 0
      ? currentWeighted > 0
        ? 100
        : 0
      : clamp(((currentWeighted - previousWeighted) / previousWeighted) * 50 + 50, 0, 100);

  const score = Math.round(
    intensityScore * 0.4 + diffusionScore * 0.25 + civilianScore * 0.25 + accelerationScore * 0.1
  );

  return {
    level: scoreLevel(score),
    score,
    trend: scoreTrend(currentWeighted, previousWeighted),
    updatedAt: generatedAt,
    generatedAt,
    windowStart,
    windowEnd,
    source: "gdelt",
    schemaVersion: 1,
    eventCount: currentEvents.length,
    countryCount
  };
}
