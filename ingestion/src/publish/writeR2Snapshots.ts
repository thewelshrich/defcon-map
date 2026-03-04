import type { DefconSummarySnapshot } from "../../../src/domain/defcon";
import type { ConflictEventFeed } from "../../../src/domain/events";
import type { IngestionManifest, RawGdeltSnapshot, SnapshotStore } from "../types";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function rawSnapshotPath(runDate: Date, runId: string) {
  return [
    "raw/gdelt",
    String(runDate.getUTCFullYear()),
    pad(runDate.getUTCMonth() + 1),
    pad(runDate.getUTCDate()),
    pad(runDate.getUTCHours()),
    `${runId}.json`
  ].join("/");
}

export async function writeR2Snapshots(args: {
  snapshotStore: SnapshotStore;
  runDate: Date;
  runId: string;
  rawSnapshot?: RawGdeltSnapshot;
  eventFeed: ConflictEventFeed;
  summary: DefconSummarySnapshot;
  manifest: IngestionManifest;
}) {
  const { snapshotStore, runDate, runId, rawSnapshot, eventFeed, summary, manifest } = args;
  const resolvedRawSnapshotPath = rawSnapshotPath(runDate, runId);

  if (rawSnapshot) {
    await snapshotStore.writeJson(resolvedRawSnapshotPath, rawSnapshot);
    await snapshotStore.writeJson("latest/raw-manifest.json", {
      runId,
      rawSnapshotPath: resolvedRawSnapshotPath,
      queryVersion: rawSnapshot.queryVersion,
      capturedAt: rawSnapshot.capturedAt,
      bytesScanned: rawSnapshot.bytesScanned
    });
  }
  await snapshotStore.writeJson(`normalized/events/${runId}.json`, eventFeed);
  await snapshotStore.writeJson(`normalized/summaries/${runId}.json`, summary);
  await snapshotStore.writeJson(`manifests/${runId}.json`, manifest);
  await snapshotStore.writeJson("latest/events.json", eventFeed);
  await snapshotStore.writeJson("latest/summary.json", summary);
  await snapshotStore.writeJson("latest/manifest.json", manifest);
}
