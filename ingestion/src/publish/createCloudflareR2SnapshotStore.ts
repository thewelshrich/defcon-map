import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { SnapshotStore } from "../types";
import { retryWithBackoff } from "../runtime/retry";

export function createCloudflareR2SnapshotStore(args: {
  accountId: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  client?: S3Client;
  retry?: {
    retries?: number;
    wait?: (delayMs: number) => Promise<void>;
  };
}): SnapshotStore {
  const { accountId, bucket, accessKeyId, secretAccessKey, retry } = args;
  const client =
    args.client ??
    new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

  return {
    async writeJson(path, value) {
      await retryWithBackoff({
        operation: () =>
          client.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: path,
              Body: JSON.stringify(value, null, 2),
              ContentType: "application/json"
            })
          ),
        retries: retry?.retries,
        wait: retry?.wait
      });
    }
  };
}
