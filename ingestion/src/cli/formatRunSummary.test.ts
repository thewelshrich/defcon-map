import { describe, expect, it } from "vitest";

import { formatRunSummary } from "./formatRunSummary";

describe("formatRunSummary", () => {
  it("includes bytes scanned and a human-readable megabyte estimate", () => {
    expect(
      formatRunSummary({
        runId: "run-1",
        status: "success",
        rowsPublished: 12,
        bytesScanned: 1_572_864
      })
    ).toMatchObject({
      runId: "run-1",
      status: "success",
      rowsPublished: 12,
      bytesScanned: 1_572_864,
      megabytesScanned: 1.5
    });
  });
});
