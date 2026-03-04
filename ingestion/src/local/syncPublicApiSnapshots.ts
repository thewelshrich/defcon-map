import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { DefconSummarySnapshot } from "../../../src/domain/defcon";
import type { ConflictEventFeed } from "../../../src/domain/events";

export async function syncPublicApiSnapshots(args: {
  outputDirectory: string;
  eventFeed: ConflictEventFeed;
  summary: DefconSummarySnapshot;
}) {
  const { outputDirectory, eventFeed, summary } = args;

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(join(outputDirectory, "events.json"), JSON.stringify(eventFeed, null, 2));
  await writeFile(join(outputDirectory, "summary.json"), JSON.stringify(summary, null, 2));
}
