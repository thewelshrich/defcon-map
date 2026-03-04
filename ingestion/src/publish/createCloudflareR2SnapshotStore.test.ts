import { describe, expect, it, vi } from "vitest";

import { createCloudflareR2SnapshotStore } from "./createCloudflareR2SnapshotStore";

describe("createCloudflareR2SnapshotStore", () => {
  it("retries failed writes before succeeding", async () => {
    const send = vi
      .fn<(command: unknown) => Promise<void>>()
      .mockRejectedValueOnce(new Error("temporary r2 failure"))
      .mockResolvedValue(undefined);
    const wait = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    const store = createCloudflareR2SnapshotStore({
      accountId: "account-123",
      bucket: "snapshots",
      accessKeyId: "key",
      secretAccessKey: "secret",
      client: { send } as never,
      retry: {
        retries: 2,
        wait
      }
    });

    await store.writeJson("latest/events.json", { ok: true });

    expect(send).toHaveBeenCalledTimes(2);
    expect(wait).toHaveBeenCalledTimes(1);
    expect(wait).toHaveBeenCalledWith(100);
  });
});
