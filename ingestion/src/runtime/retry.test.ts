import { describe, expect, it, vi } from "vitest";

import { retryWithBackoff } from "./retry";

describe("retryWithBackoff", () => {
  it("retries a failing operation until it succeeds", async () => {
    const operation = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("temporary failure"))
      .mockRejectedValueOnce(new Error("temporary failure"))
      .mockResolvedValue("ok");
    const wait = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    await expect(
      retryWithBackoff({
        operation,
        retries: 3,
        wait
      })
    ).resolves.toBe("ok");

    expect(operation).toHaveBeenCalledTimes(3);
    expect(wait).toHaveBeenCalledTimes(2);
    expect(wait).toHaveBeenNthCalledWith(1, 100);
    expect(wait).toHaveBeenNthCalledWith(2, 200);
  });

  it("throws the final error when retries are exhausted", async () => {
    const operation = vi.fn<() => Promise<string>>().mockRejectedValue(new Error("still failing"));
    const wait = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);

    await expect(
      retryWithBackoff({
        operation,
        retries: 2,
        wait
      })
    ).rejects.toThrow("still failing");

    expect(operation).toHaveBeenCalledTimes(3);
    expect(wait).toHaveBeenCalledTimes(2);
  });
});
