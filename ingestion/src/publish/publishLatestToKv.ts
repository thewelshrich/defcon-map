import type { DefconSummarySnapshot } from "../../../src/domain/defcon";
import type { ConflictEventFeed } from "../../../src/domain/events";
import type { IngestionManifest, KeyValueStore } from "../types";

export async function publishLatestToKv(args: {
  keyValueStore: KeyValueStore;
  eventFeed: ConflictEventFeed;
  summary: DefconSummarySnapshot;
  manifest: IngestionManifest;
}) {
  const { keyValueStore, eventFeed, summary, manifest } = args;

  await keyValueStore.put("events:latest", JSON.stringify(eventFeed));
  await keyValueStore.put("summary:latest", JSON.stringify(summary));
  await keyValueStore.put("manifest:latest", JSON.stringify(manifest));
}
