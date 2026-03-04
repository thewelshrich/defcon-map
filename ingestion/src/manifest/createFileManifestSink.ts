import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

import type { IngestionManifest, ManifestSink } from "../types";

export function createFileManifestSink(filePath: string): ManifestSink {
  return {
    async write(manifest: IngestionManifest) {
      await mkdir(dirname(filePath), { recursive: true });
      await appendFile(filePath, `${JSON.stringify(manifest)}\n`);
    }
  };
}
