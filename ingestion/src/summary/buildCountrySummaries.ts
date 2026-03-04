import type { CountrySummary, PublishedConflictEvent } from "../types";

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

export function buildCountrySummaries(events: PublishedConflictEvent[]): CountrySummary[] {
  const summaries = new Map<string, CountrySummary>();

  for (const event of events) {
    const existing =
      summaries.get(event.countryCode) ??
      {
        countryCode: event.countryCode,
        countryName: event.countryName,
        eventCount: 0,
        severeEventCount: 0,
        civilianImpactCount: 0,
        weightedSeverity: 0,
        latestEventAt: event.occurredAt
      };

    existing.eventCount += 1;
    existing.weightedSeverity += severityWeight(event.severity);

    if (event.severity === "high" || event.severity === "critical") {
      existing.severeEventCount += 1;
    }

    if (event.civilianImpact) {
      existing.civilianImpactCount += 1;
    }

    if (Date.parse(event.occurredAt) > Date.parse(existing.latestEventAt)) {
      existing.latestEventAt = event.occurredAt;
    }

    summaries.set(event.countryCode, existing);
  }

  return [...summaries.values()].sort((left, right) => right.weightedSeverity - left.weightedSeverity);
}
