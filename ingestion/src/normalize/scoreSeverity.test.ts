import { describe, expect, it } from "vitest";

import { scoreSeverity } from "./scoreSeverity";

describe("scoreSeverity", () => {
  it("returns critical for civilian events and very high mention count", () => {
    expect(scoreSeverity({ category: "civilian", mentionCount: 5 })).toBe("critical");
    expect(scoreSeverity({ category: "explosion", mentionCount: 120 })).toBe("critical");
  });

  it("returns high for high mention volume and battle-specific threshold", () => {
    expect(scoreSeverity({ category: "strategic", mentionCount: 55 })).toBe("high");
    expect(scoreSeverity({ category: "battle", mentionCount: 35 })).toBe("high");
  });

  it("returns medium for mid mention volume", () => {
    expect(scoreSeverity({ category: "explosion", mentionCount: 24 })).toBe("medium");
  });

  it("returns low when mention volume is limited", () => {
    expect(scoreSeverity({ category: "explosion", mentionCount: 10 })).toBe("low");
  });
});
