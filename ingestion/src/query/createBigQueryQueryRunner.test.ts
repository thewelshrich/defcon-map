import { describe, expect, it, vi } from "vitest";

import { createBigQueryQueryRunner } from "./createBigQueryQueryRunner";

describe("createBigQueryQueryRunner", () => {
  it("executes standard SQL and returns rows plus processed bytes", async () => {
    const getMetadata = vi.fn().mockResolvedValue([
      {
        statistics: {
          totalBytesProcessed: "2048"
        }
      }
    ]);
    const getQueryResults = vi.fn().mockResolvedValue([
      [
        {
          GLOBALEVENTID: "1",
          DATEADDED: "20260304132819",
          SOURCEURL: "https://example.com/story"
        }
      ]
    ]);
    const createQueryJob = vi.fn().mockResolvedValue([
      {
        getQueryResults,
        getMetadata
      }
    ]);

    const runner = createBigQueryQueryRunner({
      client: {
        createQueryJob
      },
      location: "US"
    });

    const result = await runner.runQuery({
      sql: "SELECT 1",
      queryVersion: "v1"
    });

    expect(createQueryJob).toHaveBeenCalledWith({
      query: "SELECT 1",
      useLegacySql: false,
      location: "US"
    });
    expect(result).toMatchObject({
      rows: [{ GLOBALEVENTID: "1" }],
      bytesScanned: 2048
    });
  });
});
