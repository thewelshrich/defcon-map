import { describe, expect, it } from "vitest";

import { detectCivilianImpact } from "./detectCivilianImpact";

describe("detectCivilianImpact", () => {
  it("flags civilian category events", () => {
    expect(
      detectCivilianImpact({
        category: "civilian",
        actor1Name: null,
        actor2Name: null,
        sourceUrl: null
      })
    ).toBe(true);
  });

  it("flags events with civilian actor names", () => {
    expect(
      detectCivilianImpact({
        category: "explosion",
        actor1Name: "ISRAEL",
        actor2Name: "HOSPITAL",
        sourceUrl: "https://example.com/story"
      })
    ).toBe(true);
  });

  it("flags events with civilian impact URL keywords", () => {
    expect(
      detectCivilianImpact({
        category: "explosion",
        actor1Name: "IRAN",
        actor2Name: "ISRAEL",
        sourceUrl: "https://example.com/world/hospital-damaged-in-airstrike"
      })
    ).toBe(true);
  });

  it("does not flag non-civilian signals", () => {
    expect(
      detectCivilianImpact({
        category: "battle",
        actor1Name: "ISRAEL",
        actor2Name: "IRAN",
        sourceUrl: "https://example.com/world/missile-intercept-report"
      })
    ).toBe(false);
  });
});
