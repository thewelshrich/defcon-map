import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { formatRunSummary } from "./formatRunSummary";
import { createFileKeyValueStore } from "../local/fileKeyValueStore";
import { createFileSnapshotStore } from "../local/fileSnapshotStore";
import { syncPublicApiSnapshots } from "../local/syncPublicApiSnapshots";
import { loadRawSnapshotByRunId } from "../replay/loadRawSnapshotByRunId";
import { runNormalizationFromRawSnapshot } from "../replay/runNormalizationFromRawSnapshot";
import { log } from "../runtime/log";

type CliOptions = {
  runId: string | null;
  source: string;
  output: string;
  publicApiDir: string | null;
  writeKv: boolean;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    runId: null,
    source: ".local/ingestion-production",
    output: ".local/ingestion-replay",
    publicApiDir: null,
    writeKv: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--run-id" && next) {
      options.runId = next;
      index += 1;
      continue;
    }

    if (arg === "--source" && next) {
      options.source = next;
      index += 1;
      continue;
    }

    if (arg === "--output" && next) {
      options.output = next;
      index += 1;
      continue;
    }

    if (arg === "--sync-public-api") {
      options.publicApiDir = "public/api";
      continue;
    }

    if (arg === "--public-api-dir" && next) {
      options.publicApiDir = next;
      index += 1;
      continue;
    }

    if (arg === "--no-kv") {
      options.writeKv = false;
    }
  }

  return options;
}

async function loadReplaySource(runId: string, sourceDirectory: string) {
  try {
    return await loadRawSnapshotByRunId({
      outputDirectory: sourceDirectory,
      runId
    });
  } catch (error) {
    const defaultProductionDirectory = resolve(process.cwd(), ".local/ingestion-production");

    if (sourceDirectory !== defaultProductionDirectory) {
      throw error;
    }

    const fallbackDirectory = resolve(process.cwd(), ".local/ingestion");

    return loadRawSnapshotByRunId({
      outputDirectory: fallbackDirectory,
      runId
    });
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.runId) {
    throw new Error("Missing required argument: --run-id");
  }

  const sourceDirectory = resolve(process.cwd(), options.source);
  const outputDirectory = resolve(process.cwd(), options.output);

  await mkdir(outputDirectory, { recursive: true });

  log("info", "Starting replay normalization run", {
    runId: options.runId,
    sourceDirectory,
    outputDirectory
  });

  const rawSnapshot = await loadReplaySource(options.runId, sourceDirectory);
  const result = await runNormalizationFromRawSnapshot({
    rawSnapshot,
    snapshotStore: createFileSnapshotStore(resolve(outputDirectory, "r2")),
    keyValueStore: options.writeKv
      ? createFileKeyValueStore(resolve(outputDirectory, "kv"))
      : {
          put: async () => {}
        }
  });

  if (options.publicApiDir) {
    await syncPublicApiSnapshots({
      outputDirectory: resolve(process.cwd(), options.publicApiDir),
      eventFeed: result.eventFeed,
      summary: result.summary
    });
  }

  process.stdout.write(
    `${JSON.stringify(
      formatRunSummary({
        runId: result.manifest.runId,
        status: result.manifest.status,
        rowsPublished: result.manifest.rowsPublished,
        bytesScanned: result.manifest.bytesScanned,
        dryRun: true,
        outputDirectory
      }),
      null,
      2
    )}\n`
  );
  log("info", "Completed replay normalization run", {
    runId: result.manifest.runId,
    rowsPublished: result.manifest.rowsPublished,
    outputDirectory
  });
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown replay normalization error";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
