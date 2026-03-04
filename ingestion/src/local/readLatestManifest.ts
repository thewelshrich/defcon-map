import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { IngestionManifest } from "../types";

export async function readLatestManifest(outputDirectory: string): Promise<IngestionManifest> {
  const manifestPath = join(outputDirectory, "r2", "latest", "manifest.json");
  const rawJson = await readFile(manifestPath, "utf8");

  return JSON.parse(rawJson) as IngestionManifest;
}
