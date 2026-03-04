import type { BigQueryQueryRunner, ExtractedGdeltRow } from "../types";
import { retryWithBackoff } from "../runtime/retry";

type BigQueryJobLike = {
  getQueryResults: () => Promise<[ExtractedGdeltRow[], ...unknown[]]>;
  getMetadata: () => Promise<
    [
      {
        statistics?: {
          totalBytesProcessed?: string;
        };
      },
      ...unknown[]
    ]
  >;
};

type BigQueryClientLike = {
  createQueryJob: (options: {
    query: string;
    useLegacySql: false;
    location: string;
  }) => Promise<[BigQueryJobLike, ...unknown[]]>;
};

export function createBigQueryQueryRunner(args: {
  client: BigQueryClientLike;
  location: string;
  retry?: {
    retries?: number;
    wait?: (delayMs: number) => Promise<void>;
  };
}): BigQueryQueryRunner {
  const { client, location, retry } = args;

  return {
    async runQuery({ sql }) {
      const [job] = await retryWithBackoff({
        operation: () =>
          client.createQueryJob({
            query: sql,
            useLegacySql: false,
            location
          }),
        retries: retry?.retries,
        wait: retry?.wait
      });
      const [rows] = await retryWithBackoff({
        operation: () => job.getQueryResults(),
        retries: retry?.retries,
        wait: retry?.wait
      });
      const [metadata] = await retryWithBackoff({
        operation: () => job.getMetadata(),
        retries: retry?.retries,
        wait: retry?.wait
      });

      return {
        rows,
        bytesScanned: Number(metadata.statistics?.totalBytesProcessed ?? 0)
      };
    }
  };
}
