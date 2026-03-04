import { describe, expect, it } from "vitest";

import { formatDefconTimestamp, getDefconAccentClass } from "./defcon";

describe("formatDefconTimestamp", () => {
  it("formats an ISO timestamp into a UTC display string", () => {
    expect(formatDefconTimestamp("2026-03-04T09:30:00.000Z")).toBe("2026-03-04 09:30 UTC");
  });
});

describe("getDefconAccentClass", () => {
  it("maps DEFCON levels to stable accent class names", () => {
    expect(getDefconAccentClass(1)).toBe("defcon-critical");
    expect(getDefconAccentClass(5)).toBe("defcon-normal");
  });
});
