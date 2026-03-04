import type { EventConfidence } from "../../../src/domain/events";
import type { NormalizedConflictCandidate } from "../types";

function confidenceRank(confidence: EventConfidence) {
  switch (confidence) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
  }
}

function compareCandidates(left: NormalizedConflictCandidate, right: NormalizedConflictCandidate) {
  const confidenceDifference = confidenceRank(left.confidence) - confidenceRank(right.confidence);

  if (confidenceDifference !== 0) {
    return confidenceDifference;
  }

  const mentionDifference = left.mentionCount - right.mentionCount;

  if (mentionDifference !== 0) {
    return mentionDifference;
  }

  return Date.parse(left.occurredAt) - Date.parse(right.occurredAt);
}

function dedupeByKey(events: NormalizedConflictCandidate[], getKey: (event: NormalizedConflictCandidate) => string) {
  const deduped = new Map<string, NormalizedConflictCandidate>();

  for (const event of events) {
    const key = getKey(event);
    const current = deduped.get(key);

    if (!current || compareCandidates(event, current) > 0) {
      deduped.set(key, event);
    }
  }

  return {
    events: [...deduped.values()],
    dedupeCount: events.length - deduped.size
  };
}

function toTwoHourBucket(occurredAt: string) {
  const date = new Date(occurredAt);
  const hour = date.getUTCHours();
  const bucketHour = hour - (hour % 2);
  date.setUTCHours(bucketHour, 0, 0, 0);
  return date.toISOString().slice(0, 13);
}

function toCoarseIncidentKey(event: NormalizedConflictCandidate) {
  const lat = event.latitude.toFixed(1);
  const lon = event.longitude.toFixed(1);
  const bucket = toTwoHourBucket(event.occurredAt);

  return [event.category, event.countryCode, lat, lon, bucket].join("|");
}

export function dedupeEvents(events: NormalizedConflictCandidate[]) {
  return dedupeByKey(events, (event) => event.dedupeKey);
}

export function dedupeIncidentEvents(events: NormalizedConflictCandidate[]) {
  return dedupeByKey(events, toCoarseIncidentKey);
}
