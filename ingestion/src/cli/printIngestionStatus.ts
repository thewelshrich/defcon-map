import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { formatRunSummary } from "./formatRunSummary";
import { readLatestManifest } from "../local/readLatestManifest";

function parseArgs(argv: string[]) {
  let output = ".local/ingestion";

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--output" && argv[index + 1]) {
      output = argv[index + 1];
      index += 1;
    }
  }

  return {
    output
  };
}

async function readOptionalJson(path: string) {
  try {
    const rawJson = await readFile(path, "utf8");
    return JSON.parse(rawJson) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const outputDirectory = resolve(process.cwd(), options.output);
  const manifest = await readLatestManifest(outputDirectory);
  const latestRawManifest = await readOptionalJson(resolve(outputDirectory, "r2", "latest", "raw-manifest.json"));
  const latestEvents = await readOptionalJson(resolve(outputDirectory, "r2", "latest", "events.json"));

  process.stdout.write(
    `${JSON.stringify(
      {
        ...formatRunSummary({
          runId: manifest.runId,
          status: manifest.status,
          finishedAt: manifest.finishedAt,
          rowsPublished: manifest.rowsPublished,
          bytesScanned: manifest.bytesScanned
        }),
        ...(latestRawManifest
          ? {
              latestRawRunId: latestRawManifest.runId,
              latestRawBytesScanned: latestRawManifest.bytesScanned
            }
          : {}),
        ...(latestEvents && Array.isArray(latestEvents.events)
          ? {
              latestEventCount: latestEvents.events.length
            }
          : {})
      },
      null,
      2
    )}\n`
  );
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown status error";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
