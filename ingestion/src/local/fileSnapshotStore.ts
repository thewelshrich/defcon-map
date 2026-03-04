import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { SnapshotStore } from "../types";

export function createFileSnapshotStore(baseDirectory: string): SnapshotStore {
  return {
    async writeJson(path, value) {
      const outputPath = join(baseDirectory, path);
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, JSON.stringify(value, null, 2));
    }
  };
}
