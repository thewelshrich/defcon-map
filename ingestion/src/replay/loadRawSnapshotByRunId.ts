import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import type { RawGdeltSnapshot, RawSnapshotManifest, ReplayRunSource } from "../types";

async function pathExists(path: string) {
  try {
    await readFile(path, "utf8");
    return true;
  } catch {
    return false;
  }
}

async function findSnapshotPath(root: string, runId: string): Promise<string | null> {
  const entries = await readdir(root, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = join(root, entry.name);

    if (entry.isDirectory()) {
      const nested = await findSnapshotPath(entryPath, runId);

      if (nested) {
        return nested;
      }

      continue;
    }

    if (entry.name === `${runId}.json` || entry.name === `${runId}.json.gz`) {
      return entryPath;
    }
  }

  return null;
}

export async function loadRawSnapshotByRunId(args: {
  outputDirectory: string;
  runId: string;
}): Promise<RawGdeltSnapshot & ReplayRunSource> {
  const { outputDirectory, runId } = args;
  const r2Directory = join(outputDirectory, "r2");
  const latestRawManifestPath = join(r2Directory, "latest", "raw-manifest.json");
  let snapshotPath: string | null = null;

  if (await pathExists(latestRawManifestPath)) {
    const latestManifest = JSON.parse(await readFile(latestRawManifestPath, "utf8")) as RawSnapshotManifest;

    if (latestManifest.runId === runId) {
      snapshotPath = join(r2Directory, latestManifest.rawSnapshotPath);
    }
  }

  if (!snapshotPath) {
    snapshotPath = await findSnapshotPath(join(r2Directory, "raw", "gdelt"), runId);
  }

  if (!snapshotPath) {
    throw new Error(`Could not find raw snapshot for runId: ${runId}`);
  }

  const rawJson = await readFile(snapshotPath, "utf8");
  const parsed = JSON.parse(rawJson) as RawGdeltSnapshot | RawGdeltSnapshot["rows"];

  if (Array.isArray(parsed)) {
    return {
      type: "raw-snapshot",
      runId,
      snapshotPath,
      queryVersion: "legacy",
      capturedAt: new Date(0).toISOString(),
      sourceWindowStart: new Date(0).toISOString(),
      sourceWindowEnd: new Date(0).toISOString(),
      bytesScanned: 0,
      rows: parsed
    };
  }

  return {
    type: "raw-snapshot",
    snapshotPath,
    ...parsed
  };
}
