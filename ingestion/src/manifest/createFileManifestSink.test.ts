import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createFileManifestSink } from "./createFileManifestSink";
import type { IngestionManifest } from "../types";

const createdDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    createdDirs.splice(0).map(async (dir) => {
      const { rm } = await import("node:fs/promises");
      await rm(dir, { recursive: true, force: true });
    })
  );
});

const manifest: IngestionManifest = {
  runId: "run-1",
  startedAt: "2026-03-04T13:00:00.000Z",
  finishedAt: "2026-03-04T13:01:00.000Z",
  status: "success",
  queryVersion: "v1",
  sourceWindowStart: "2026-02-19T13:00:00.000Z",
  sourceWindowEnd: "2026-03-04T13:00:00.000Z",
  rowsExtracted: 20,
  rowsDropped: 3,
  rowsPublished: 7,
  dedupeCount: 5,
  bytesScanned: 2048,
  publishReason: "published-latest-snapshots",
  errorSummary: null
};

describe("createFileManifestSink", () => {
  it("appends manifests as newline-delimited JSON", async () => {
    const directory = await mkdtemp(join(tmpdir(), "gdelt-manifest-sink-"));
    createdDirs.push(directory);

    const sink = createFileManifestSink(join(directory, "manifests.ndjson"));

    await sink.write(manifest);
    await sink.write({ ...manifest, runId: "run-2" });

    const contents = await readFile(join(directory, "manifests.ndjson"), "utf8");
    const lines = contents.trim().split("\n").map((line) => JSON.parse(line));

    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatchObject({ runId: "run-1" });
    expect(lines[1]).toMatchObject({ runId: "run-2" });
  });
});
