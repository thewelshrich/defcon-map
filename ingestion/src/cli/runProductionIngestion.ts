import { BigQuery } from "@google-cloud/bigquery";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { getCloudflareRuntimeConfig, getGcpRuntimeConfig } from "../config";
import { formatRunSummary } from "./formatRunSummary";
import { parseProductionCliOptions } from "./productionOptions";
import { createFileKeyValueStore } from "../local/fileKeyValueStore";
import { createFileSnapshotStore } from "../local/fileSnapshotStore";
import { createWebhookManifestSink } from "../manifest/createWebhookManifestSink";
import { createCloudflareKvStore } from "../publish/createCloudflareKvStore";
import { createCloudflareR2SnapshotStore } from "../publish/createCloudflareR2SnapshotStore";
import { createBigQueryQueryRunner } from "../query/createBigQueryQueryRunner";
import { log } from "../runtime/log";
import { runIngestion } from "../runIngestion";

async function main() {
  const options = parseProductionCliOptions(process.argv.slice(2));
  const gcpConfig = getGcpRuntimeConfig();
  log("info", "Starting production ingestion run", {
    projectId: gcpConfig.projectId,
    location: gcpConfig.location,
    bucket: options.dryRun ? null : process.env.CLOUDFLARE_R2_BUCKET ?? null,
    dryRun: options.dryRun
  });
  const bigQuery = new BigQuery({
    projectId: gcpConfig.projectId
  });

  let snapshotStore;
  let keyValueStore;
  let outputDirectory: string | null = null;

  if (options.dryRun) {
    outputDirectory = resolve(process.cwd(), options.output);
    await mkdir(outputDirectory, { recursive: true });
    snapshotStore = createFileSnapshotStore(resolve(outputDirectory, "r2"));
    keyValueStore = createFileKeyValueStore(resolve(outputDirectory, "kv"));
  } else {
    const cloudflareConfig = getCloudflareRuntimeConfig();
    snapshotStore = createCloudflareR2SnapshotStore({
      accountId: cloudflareConfig.accountId,
      bucket: cloudflareConfig.r2Bucket,
      accessKeyId: cloudflareConfig.r2AccessKeyId,
      secretAccessKey: cloudflareConfig.r2SecretAccessKey
    });
    keyValueStore = createCloudflareKvStore({
      accountId: cloudflareConfig.accountId,
      namespaceId: cloudflareConfig.kvNamespaceId,
      apiToken: cloudflareConfig.apiToken
    });
  }

  const result = await runIngestion({
    queryRunner: createBigQueryQueryRunner({
      client: bigQuery,
      location: gcpConfig.location
    }),
    snapshotStore,
    keyValueStore
  });

  const manifestWebhookUrl = options.dryRun ? null : process.env.INGEST_MANIFEST_WEBHOOK_URL;

  if (manifestWebhookUrl) {
    await createWebhookManifestSink(manifestWebhookUrl).write(result.manifest);
  }

  process.stdout.write(
    `${JSON.stringify(
      formatRunSummary({
        runId: result.manifest.runId,
        status: result.manifest.status,
        rowsPublished: result.manifest.rowsPublished,
        bytesScanned: result.manifest.bytesScanned,
        dryRun: options.dryRun,
        outputDirectory
      }),
      null,
      2
    )}\n`
  );
  log("info", "Completed production ingestion run", {
    runId: result.manifest.runId,
    rowsPublished: result.manifest.rowsPublished,
    dryRun: options.dryRun,
    outputDirectory
  });
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown production ingestion error";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
