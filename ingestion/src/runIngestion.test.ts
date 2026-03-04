import { describe, expect, it, vi } from "vitest";

import { runIngestion } from "./runIngestion";
import type { ExtractedGdeltRow } from "./types";

const row: ExtractedGdeltRow = {
  GLOBALEVENTID: "12345",
  SQLDATE: "20260304",
  DATEADDED: "20260304110000",
  EventCode: "200",
  EventRootCode: "20",
  EventBaseCode: "200",
  QuadClass: 4,
  GoldsteinScale: -9,
  NumMentions: 140,
  Actor1CountryCode: "RUS",
  Actor2CountryCode: "UKR",
  Actor1Name: "Russia",
  Actor2Name: "Ukraine",
  ActionGeo_CountryCode: "UKR",
  ActionGeo_Type: 4,
  ActionGeo_FullName: "Kyiv, Ukraine",
  ActionGeo_Lat: 50.4501,
  ActionGeo_Long: 30.5234,
  SOURCEURL: "https://example.com/story"
};

describe("runIngestion", () => {
  it("publishes normalized snapshots and latest cache keys on a successful run", async () => {
    const writes: string[] = [];
    const keys: string[] = [];

    const result = await runIngestion({
      queryRunner: {
        runQuery: vi.fn().mockResolvedValue({
          rows: [row],
          bytesScanned: 1024
        })
      },
      snapshotStore: {
        writeJson: vi.fn(async (path) => {
          writes.push(path);
        })
      },
      keyValueStore: {
        put: vi.fn(async (key) => {
          keys.push(key);
        })
      },
      now: () => new Date("2026-03-04T12:00:00.000Z")
    });

    expect(result.manifest.status).toBe("success");
    expect(result.eventFeed.events).toHaveLength(1);
    expect(writes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("raw/gdelt/2026/03/04/12/"),
        "latest/raw-manifest.json",
        expect.stringContaining("normalized/events/"),
        "latest/events.json",
        "latest/summary.json",
        "latest/manifest.json"
      ])
    );
    expect(keys).toEqual(["events:latest", "summary:latest", "manifest:latest"]);
  });

  it("refuses to publish when no rows are extracted", async () => {
    await expect(
      runIngestion({
        queryRunner: {
          runQuery: vi.fn().mockResolvedValue({
            rows: [],
            bytesScanned: 0
          })
        },
        snapshotStore: {
          writeJson: vi.fn()
        },
        keyValueStore: {
          put: vi.fn()
        },
        now: () => new Date("2026-03-04T12:00:00.000Z")
      })
    ).rejects.toThrow("Ingestion produced no rows");
  });

  it("can rebuild normalized outputs from a stored raw snapshot without querying BigQuery", async () => {
    const { runNormalizationFromRawSnapshot } = await import("./replay/runNormalizationFromRawSnapshot");

    const writes: string[] = [];
    const keys: string[] = [];

    const result = await runNormalizationFromRawSnapshot({
      rawSnapshot: {
        runId: "20260304-120000000",
        queryVersion: "v1",
        capturedAt: "2026-03-04T12:00:00.000Z",
        sourceWindowStart: "2026-03-01T12:00:00.000Z",
        sourceWindowEnd: "2026-03-04T12:00:00.000Z",
        bytesScanned: 1024,
        rows: [row]
      },
      snapshotStore: {
        writeJson: vi.fn(async (path) => {
          writes.push(path);
        })
      },
      keyValueStore: {
        put: vi.fn(async (key) => {
          keys.push(key);
        })
      },
      now: () => new Date("2026-03-04T12:30:00.000Z")
    });

    expect(result.eventFeed.events).toHaveLength(1);
    expect(writes).toEqual(
      expect.arrayContaining([
        expect.stringContaining("normalized/events/"),
        "latest/events.json"
      ])
    );
    expect(keys).toEqual(["events:latest", "summary:latest", "manifest:latest"]);
  });
});
