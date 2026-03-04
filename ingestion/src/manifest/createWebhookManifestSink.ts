import type { IngestionManifest, ManifestSink } from "../types";

export function createWebhookManifestSink(
  webhookUrl: string,
  fetchImpl: typeof fetch = fetch
): ManifestSink {
  return {
    async write(manifest: IngestionManifest) {
      const response = await fetchImpl(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(manifest)
      });

      if (!response.ok) {
        throw new Error("Failed to publish manifest webhook");
      }
    }
  };
}
