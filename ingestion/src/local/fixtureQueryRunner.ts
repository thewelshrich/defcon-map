import { readFile } from "node:fs/promises";

import type { BigQueryQueryRunner, ExtractedGdeltRow } from "../types";

export function createFixtureQueryRunner(fixturePath: string): BigQueryQueryRunner {
  return {
    async runQuery() {
      const rawJson = await readFile(fixturePath, "utf8");
      const rows = JSON.parse(rawJson) as ExtractedGdeltRow[];

      return {
        rows,
        bytesScanned: Buffer.byteLength(rawJson, "utf8")
      };
    }
  };
}
