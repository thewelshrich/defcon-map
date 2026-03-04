import type { ConflictEventFeed } from "../../src/domain/events";
import { buildManifest } from "./manifest/buildManifest";
import { dedupeEvents, dedupeIncidentEvents } from "./normalize/dedupeEvents";
import { mapGdeltRow } from "./normalize/mapGdeltRow";
import { buildCountrySummaries } from "./summary/buildCountrySummaries";
import { buildDefconSummary } from "./summary/buildDefconSummary";
import type {
  CountrySummary,
  IngestionManifest,
  NormalizationSourceMetadata,
  NormalizedConflictCandidate,
  PublishedConflictEvent
} from "./types";

function toIsoDate(value: Date) {
  return value.toISOString();
}

function subtractDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() - days);
  return next;
}

function isPublishableCandidate(event: NormalizedConflictCandidate) {
  return event.plotVisibility === "plot" && (event.confidence === "high" || event.confidence === "medium");
}

function toPublishedConflictEvent(event: NormalizedConflictCandidate): PublishedConflictEvent {
  const { dedupeKey: _dedupeKey, rawCountryCode: _rawCountryCode, geoPrecision: _geoPrecision, ...publishedEvent } = event;
  return publishedEvent;
}

export function buildNormalizedOutputsFromRows(args: {
  rows: NormalizedConflictCandidate["rawCountryCode"] extends never ? never : import("./types").ExtractedGdeltRow[];
  startedAt: Date;
  finishedAt: Date;
  source: NormalizationSourceMetadata;
  publicFeedWindowDays: number;
}) : {
  eventFeed: ConflictEventFeed;
  summary: import("../../src/domain/defcon").DefconSummarySnapshot;
  countrySummaries: CountrySummary[];
  manifest: IngestionManifest;
} {
  const { rows, startedAt, finishedAt, source, publicFeedWindowDays } = args;
  const normalized = rows
    .map((row) => mapGdeltRow(row))
    .filter((row): row is NormalizedConflictCandidate => row !== null);
  const rowsDropped = rows.length - normalized.length;
  const fineDeduped = dedupeEvents(normalized);
  const coarseDeduped = dedupeIncidentEvents(fineDeduped.events);
  const publishedEvents = coarseDeduped.events.filter(isPublishableCandidate).map(toPublishedConflictEvent);

  const windowEndDate = startedAt;
  const windowStartDate = subtractDays(windowEndDate, publicFeedWindowDays);
  const previousWindowStartDate = subtractDays(windowStartDate, publicFeedWindowDays);
  const windowStart = toIsoDate(windowStartDate);
  const windowEnd = toIsoDate(windowEndDate);
  const previousWindowStart = toIsoDate(previousWindowStartDate);

  const currentEvents = publishedEvents.filter(
    (event) => event.occurredAt >= windowStart && event.occurredAt <= windowEnd
  );
  const previousEvents = publishedEvents.filter(
    (event) => event.occurredAt >= previousWindowStart && event.occurredAt < windowStart
  );

  const eventFeed: ConflictEventFeed = {
    generatedAt: toIsoDate(startedAt),
    windowStart,
    windowEnd,
    source: "gdelt",
    schemaVersion: 1,
    events: currentEvents
  };

  const summary = buildDefconSummary({
    currentEvents,
    previousEvents,
    generatedAt: toIsoDate(startedAt),
    windowStart,
    windowEnd
  });
  const countrySummaries = buildCountrySummaries(currentEvents);
  const manifest = buildManifest({
    runId: source.runId,
    queryVersion: source.queryVersion,
    startedAt: toIsoDate(startedAt),
    finishedAt: toIsoDate(finishedAt),
    status: "success",
    sourceWindowStart: source.sourceWindowStart,
    sourceWindowEnd: source.sourceWindowEnd,
    rowsExtracted: rows.length,
    rowsDropped,
    rowsPublished: currentEvents.length,
    dedupeCount: fineDeduped.dedupeCount + coarseDeduped.dedupeCount,
    bytesScanned: source.bytesScanned
  });

  return {
    eventFeed,
    summary,
    countrySummaries,
    manifest
  };
}
