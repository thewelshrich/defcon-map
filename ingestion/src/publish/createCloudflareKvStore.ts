import type { KeyValueStore } from "../types";
import { retryWithBackoff } from "../runtime/retry";

export function createCloudflareKvStore(
  args: {
    accountId: string;
    namespaceId: string;
    apiToken: string;
    retry?: {
      retries?: number;
      wait?: (delayMs: number) => Promise<void>;
    };
  },
  fetchImpl: typeof fetch = fetch
): KeyValueStore {
  const { accountId, namespaceId, apiToken, retry } = args;

  return {
    async put(key, value) {
      const response = await retryWithBackoff({
        operation: () =>
          fetchImpl(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${encodeURIComponent(
              key
            )}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${apiToken}`,
                "Content-Type": "application/json"
              },
              body: value
            }
          ),
        retries: retry?.retries,
        wait: retry?.wait
      });

      if (!response.ok) {
        throw new Error(`Failed to write KV key ${key}`);
      }
    }
  };
}
