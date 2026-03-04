import { getIngestionConfig } from "../config";
import { buildNormalizedOutputsFromRows } from "../buildNormalizedOutputsFromRows";
import { publishLatestToKv } from "../publish/publishLatestToKv";
import { writeR2Snapshots } from "../publish/writeR2Snapshots";
import type { IngestionRunResult, KeyValueStore, RawGdeltSnapshot, SnapshotStore } from "../types";

export async function runNormalizationFromRawSnapshot(args: {
  rawSnapshot: RawGdeltSnapshot;
  snapshotStore: SnapshotStore;
  keyValueStore: KeyValueStore;
  now?: () => Date;
}): Promise<IngestionRunResult> {
  const { rawSnapshot, snapshotStore, keyValueStore, now = () => new Date() } = args;
  const config = getIngestionConfig();
  const startedAt = now();
  const finishedAt = now();
  const { eventFeed, summary, countrySummaries, manifest } = buildNormalizedOutputsFromRows({
    rows: rawSnapshot.rows,
    startedAt,
    finishedAt,
    source: {
      runId: rawSnapshot.runId,
      queryVersion: rawSnapshot.queryVersion,
      sourceWindowStart: rawSnapshot.sourceWindowStart,
      sourceWindowEnd: rawSnapshot.sourceWindowEnd,
      bytesScanned: rawSnapshot.bytesScanned
    },
    publicFeedWindowDays: config.publicFeedWindowDays
  });

  await writeR2Snapshots({
    snapshotStore,
    runDate: startedAt,
    runId: rawSnapshot.runId,
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
