import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { readLatestManifest } from "./readLatestManifest";

const createdDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    createdDirs.splice(0).map(async (dir) => {
      const { rm } = await import("node:fs/promises");
      await rm(dir, { recursive: true, force: true });
    })
  );
});

describe("readLatestManifest", () => {
  it("reads the latest manifest from a local ingestion output directory", async () => {
    const directory = await mkdtemp(join(tmpdir(), "gdelt-latest-manifest-"));
    createdDirs.push(directory);

    const latestDir = join(directory, "r2", "latest");
    await mkdir(latestDir, { recursive: true });
    await writeFile(
      join(latestDir, "manifest.json"),
      JSON.stringify({
        runId: "run-1",
        status: "success",
        rowsPublished: 12
      })
    );

    const manifest = await readLatestManifest(directory);

    expect(manifest).toMatchObject({
      runId: "run-1",
      status: "success",
      rowsPublished: 12
    });
  });
});
