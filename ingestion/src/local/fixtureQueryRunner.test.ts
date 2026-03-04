import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { createFixtureQueryRunner } from "./fixtureQueryRunner";

const createdDirs: string[] = [];

afterEach(async () => {
  await Promise.all(
    createdDirs.splice(0).map(async (dir) => {
      const { rm } = await import("node:fs/promises");
      await rm(dir, { recursive: true, force: true });
    })
  );
});

describe("createFixtureQueryRunner", () => {
  it("loads rows from a local fixture file and reports an approximate byte count", async () => {
    const directory = await mkdtemp(join(tmpdir(), "gdelt-fixture-"));
    createdDirs.push(directory);

    const fixturePath = join(directory, "rows.json");
    await writeFile(
      fixturePath,
      JSON.stringify([
          {
            GLOBALEVENTID: "1",
            SQLDATE: "20260304",
            DATEADDED: "20260304132819",
            EventCode: "190",
          QuadClass: 4,
          GoldsteinScale: -5,
          NumMentions: 18,
          Actor1CountryCode: "RUS",
          Actor2CountryCode: "UKR",
          Actor1Name: "Russia",
          Actor2Name: "Ukraine",
          ActionGeo_CountryCode: "UKR",
          ActionGeo_FullName: "Kyiv, Ukraine",
          ActionGeo_Lat: 50.45,
          ActionGeo_Long: 30.52,
          SOURCEURL: "https://example.com/story"
        }
      ])
    );

    const runner = createFixtureQueryRunner(fixturePath);
    const result = await runner.runQuery({
      sql: "SELECT 1",
      queryVersion: "v1"
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      GLOBALEVENTID: "1",
      EventCode: "190"
    });
    expect(result.bytesScanned).toBeGreaterThan(0);
  });
});
