import type { ConflictEventFeed } from "../../src/domain/events";
import { getIngestionConfig } from "./config";
import { buildNormalizedOutputsFromRows } from "./buildNormalizedOutputsFromRows";
import { publishLatestToKv } from "./publish/publishLatestToKv";
import { writeR2Snapshots } from "./publish/writeR2Snapshots";
import { loadGdeltConflictEventsQuery, GDELT_CONFLICT_EVENTS_QUERY_VERSION } from "./query/gdeltConflictEventsQuery";
import { runBigQueryQuery } from "./query/runBigQueryQuery";
import type { IngestionRunResult, RawGdeltSnapshot } from "./types";
import type { BigQueryQueryRunner, KeyValueStore, SnapshotStore } from "./types";

function toIsoDate(value: Date) {
  return value.toISOString();
}

function makeRunId(now: Date) {
  return now.toISOString().replace(/[-:.]/g, "").replace("T", "-").replace("Z", "");
}

export async function runIngestion(args: {
  queryRunner: BigQueryQueryRunner;
  snapshotStore: SnapshotStore;
  keyValueStore: KeyValueStore;
  now?: () => Date;
}): Promise<IngestionRunResult> {
  const { queryRunner, snapshotStore, keyValueStore, now = () => new Date() } = args;
  const config = getIngestionConfig();
  const startedAt = now();
  const runId = makeRunId(startedAt);
  const queryText = await loadGdeltConflictEventsQuery();
  const { rows, bytesScanned } = await runBigQueryQuery(queryRunner, queryText, GDELT_CONFLICT_EVENTS_QUERY_VERSION);

  if (rows.length === 0) {
    throw new Error("Ingestion produced no rows");
  }
  const finishedAt = now();
  const rawSnapshot: RawGdeltSnapshot = {
    runId,
    queryVersion: GDELT_CONFLICT_EVENTS_QUERY_VERSION,
    capturedAt: toIsoDate(startedAt),
    sourceWindowStart: toIsoDate(new Date(startedAt.getTime() - config.ingestionWindowDays * 24 * 60 * 60 * 1000)),
    sourceWindowEnd: toIsoDate(startedAt),
    bytesScanned,
    rows
  };
  const { eventFeed, summary, countrySummaries, manifest } = buildNormalizedOutputsFromRows({
    rows,
    startedAt,
    finishedAt,
    source: {
      runId,
      queryVersion: GDELT_CONFLICT_EVENTS_QUERY_VERSION,
      sourceWindowStart: rawSnapshot.sourceWindowStart,
      sourceWindowEnd: rawSnapshot.sourceWindowEnd,
      bytesScanned
    },
    publicFeedWindowDays: config.publicFeedWindowDays
  });

  await writeR2Snapshots({
    snapshotStore,
    runDate: startedAt,
    runId,
    rawSnapshot,
    eventFeed,
    summary,
    manifest
  });
  await publishLatestToKv({
    keyValueStore,
    eventFeed,
    summary,
    manifest
  });

  return {
    eventFeed,
    summary,
    countrySummaries,
    manifest
  };
}
