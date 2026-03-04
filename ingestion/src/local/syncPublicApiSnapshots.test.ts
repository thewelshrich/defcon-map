import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { syncPublicApiSnapshots } from "./syncPublicApiSnapshots";

const createdDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    createdDirs.splice(0).map(async (dir) => {
      const { rm } = await import("node:fs/promises");
      await rm(dir, { recursive: true, force: true });
    })
  );
});

describe("syncPublicApiSnapshots", () => {
  it("writes latest event and summary snapshots into a target public API directory", async () => {
    const directory = await mkdtemp(join(tmpdir(), "gdelt-public-api-"));
    createdDirs.push(directory);

    await syncPublicApiSnapshots({
      outputDirectory: directory,
      eventFeed: {
        generatedAt: "2026-03-04T12:00:00.000Z",
        windowStart: "2026-02-26T12:00:00.000Z",
        windowEnd: "2026-03-04T12:00:00.000Z",
        source: "gdelt",
        schemaVersion: 1,
        events: []
      },
      summary: {
        level: 4,
        score: 32,
        trend: "steady",
        updatedAt: "2026-03-04T12:00:00.000Z",
        generatedAt: "2026-03-04T12:00:00.000Z",
        windowStart: "2026-02-26T12:00:00.000Z",
        windowEnd: "2026-03-04T12:00:00.000Z",
        source: "gdelt",
        schemaVersion: 1,
        eventCount: 0,
        countryCount: 0
      }
    });

    const eventsJson = JSON.parse(await readFile(join(directory, "events.json"), "utf8"));
    const summaryJson = JSON.parse(await readFile(join(directory, "summary.json"), "utf8"));

    expect(eventsJson).toMatchObject({
      source: "gdelt",
      events: []
    });
    expect(summaryJson).toMatchObject({
      source: "gdelt",
      level: 4
    });
  });
});
