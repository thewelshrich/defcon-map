import { describe, expect, it, vi } from "vitest";

import { createCloudflareKvStore } from "./createCloudflareKvStore";

describe("createCloudflareKvStore", () => {
  it("publishes values to the Cloudflare KV REST API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true
    });

    const store = createCloudflareKvStore(
      {
        accountId: "account-123",
        namespaceId: "namespace-456",
        apiToken: "token-789"
      },
      fetchMock
    );

    await store.put("events:latest", "{\"ok\":true}");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.cloudflare.com/client/v4/accounts/account-123/storage/kv/namespaces/namespace-456/values/events%3Alatest",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer token-789"
        }),
        body: "{\"ok\":true}"
      })
    );
  });
});
