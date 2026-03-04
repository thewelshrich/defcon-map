import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { formatRunSummary } from "./formatRunSummary";
import { createFileKeyValueStore } from "../local/fileKeyValueStore";
import { createFileSnapshotStore } from "../local/fileSnapshotStore";
import { createFixtureQueryRunner } from "../local/fixtureQueryRunner";
import { createFileManifestSink } from "../manifest/createFileManifestSink";
import { syncPublicApiSnapshots } from "../local/syncPublicApiSnapshots";
import { log } from "../runtime/log";
import { runIngestion } from "../runIngestion";

type CliOptions = {
  fixture: string;
  output: string;
  publicApiDir: string | null;
};

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    fixture: "ingestion/fixtures/gdelt-sample.json",
    output: ".local/ingestion",
    publicApiDir: null
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--fixture" && next) {
      options.fixture = next;
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
    }
  }

  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const outputDirectory = resolve(process.cwd(), options.output);
  const snapshotsDirectory = resolve(outputDirectory, "r2");
  const kvDirectory = resolve(outputDirectory, "kv");
  const fixturePath = resolve(process.cwd(), options.fixture);
  const manifestSink = createFileManifestSink(resolve(outputDirectory, "manifests.ndjson"));

  await mkdir(outputDirectory, { recursive: true });
  log("info", "Starting local ingestion run", {
    fixturePath,
    outputDirectory
  });

  const result = await runIngestion({
    queryRunner: createFixtureQueryRunner(fixturePath),
    snapshotStore: createFileSnapshotStore(snapshotsDirectory),
    keyValueStore: createFileKeyValueStore(kvDirectory)
  });
  await manifestSink.write(result.manifest);

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
        outputDirectory,
        dryRun: true
      }),
      null,
      2
    )}\n`
  );
  log("info", "Completed local ingestion run", {
    runId: result.manifest.runId,
    rowsPublished: result.manifest.rowsPublished
  });
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown ingestion error";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
