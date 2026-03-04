import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { KeyValueStore } from "../types";

function safeKeyToFileName(key: string) {
  return `${key.replace(/:/g, "__")}.json`;
}

export function createFileKeyValueStore(baseDirectory: string): KeyValueStore {
  return {
    async put(key, value) {
      const outputPath = join(baseDirectory, safeKeyToFileName(key));
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, value);
    }
  };
}
