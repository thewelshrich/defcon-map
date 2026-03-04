import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { loadRawSnapshotByRunId } from "./loadRawSnapshotByRunId";
import type { ExtractedGdeltRow } from "../types";

const createdDirectories: string[] = [];

const row: ExtractedGdeltRow = {
  GLOBALEVENTID: "1",
  SQLDATE: "20260304",
  DATEADDED: "20260304110000",
  EventCode: "190",
  EventRootCode: "19",
  EventBaseCode: "190",
  QuadClass: 4,
  GoldsteinScale: -5,
  NumMentions: 20,
  Actor1CountryCode: "IRN",
  Actor2CountryCode: "ISR",
  Actor1Name: "Iran",
  Actor2Name: "Israel",
  ActionGeo_CountryCode: "IR",
  ActionGeo_Type: 4,
  ActionGeo_FullName: "Tehran, Tehran, Iran",
  ActionGeo_Lat: 35.75,
  ActionGeo_Long: 51.5148,
  SOURCEURL: "https://example.com/story"
};

afterEach(async () => {
  await Promise.all(
    createdDirectories.splice(0).map(async (directory) => {
      const { rm } = await import("node:fs/promises");
      await rm(directory, { recursive: true, force: true });
    })
  );
});

describe("loadRawSnapshotByRunId", () => {
  it("loads an explicit raw snapshot object by run id", async () => {
    const directory = await mkdtemp(join(tmpdir(), "gdelt-replay-"));
    createdDirectories.push(directory);

    const rawDirectory = join(directory, "r2", "raw", "gdelt", "2026", "03", "04", "12");
    const latestDirectory = join(directory, "r2", "latest");

    await mkdir(rawDirectory, { recursive: true });
    await mkdir(latestDirectory, { recursive: true });

    const runId = "20260304-120000000";

    await writeFile(
      join(rawDirectory, `${runId}.json`),
      JSON.stringify({
        runId,
        queryVersion: "v1",
        capturedAt: "2026-03-04T12:00:00.000Z",
        sourceWindowStart: "2026-03-01T12:00:00.000Z",
        sourceWindowEnd: "2026-03-04T12:00:00.000Z",
        bytesScanned: 1024,
        rows: [row]
      })
    );
    await writeFile(
      join(latestDirectory, "raw-manifest.json"),
      JSON.stringify({
        runId,
        rawSnapshotPath: "raw/gdelt/2026/03/04/12/20260304-120000000.json",
        queryVersion: "v1",
        capturedAt: "2026-03-04T12:00:00.000Z",
        bytesScanned: 1024
      })
    );

    const result = await loadRawSnapshotByRunId({
      outputDirectory: directory,
      runId
    });

    expect(result.runId).toBe(runId);
    expect(result.rows).toHaveLength(1);
    expect(result.snapshotPath).toContain(`${runId}.json`);
  });

  it("supports legacy raw row arrays stored under the old .json.gz path", async () => {
    const directory = await mkdtemp(join(tmpdir(), "gdelt-replay-legacy-"));
    createdDirectories.push(directory);

    const rawDirectory = join(directory, "r2", "raw", "gdelt", "2026", "03", "04", "12");
    await mkdir(rawDirectory, { recursive: true });

    const runId = "20260304-120000001";

    await writeFile(join(rawDirectory, `${runId}.json.gz`), JSON.stringify([row]));

    const result = await loadRawSnapshotByRunId({
      outputDirectory: directory,
      runId
    });

    expect(result.runId).toBe(runId);
    expect(result.rows).toHaveLength(1);
    expect(result.queryVersion).toBe("legacy");
  });
});
