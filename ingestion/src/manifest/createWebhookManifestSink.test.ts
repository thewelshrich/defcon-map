import { describe, expect, it, vi } from "vitest";

import { createWebhookManifestSink } from "./createWebhookManifestSink";
import type { IngestionManifest } from "../types";

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

describe("createWebhookManifestSink", () => {
  it("posts manifests to a webhook endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    const sink = createWebhookManifestSink("https://example.com/hook", fetchMock);

    await sink.write(manifest);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/hook",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json"
        }),
        body: JSON.stringify(manifest)
      })
    );
  });
});
