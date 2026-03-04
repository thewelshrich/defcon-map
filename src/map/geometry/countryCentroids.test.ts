import { describe, expect, it } from "vitest";

import { getCountryCentroid } from "./countryCentroids";

describe("getCountryCentroid", () => {
  it("returns a centroid for known countries", () => {
    const centroid = getCountryCentroid("USA");

    expect(centroid).not.toBeNull();
    expect(centroid?.[0]).toBeTypeOf("number");
    expect(centroid?.[1]).toBeTypeOf("number");
  });

  it("returns null for unknown countries", () => {
    expect(getCountryCentroid("ZZZ")).toBeNull();
  });
});
