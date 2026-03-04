import { describe, expect, it } from "vitest";

import { classifyEventScope } from "./classifyEventScope";

describe("classifyEventScope", () => {
  it("classifies infrastructure incidents by URL keywords", () => {
    expect(
      classifyEventScope({
        sourceUrl: "https://example.com/world/power-outage-after-storm",
        category: "explosion",
        hasActorCountries: false,
        countryCode: "ROU",
        actor1Name: null,
        actor2Name: null
      })
    ).toBe("infrastructure");
  });

  it("classifies policy content by URL keywords", () => {
    expect(
      classifyEventScope({
        sourceUrl: "https://example.com/politics/parliament-vote-appoint-new-minister",
        category: "strategic",
        hasActorCountries: false,
        countryCode: "BRA",
        actor1Name: null,
        actor2Name: null
      })
    ).toBe("policy");
  });

  it("classifies domestic content by URL keywords", () => {
    expect(
      classifyEventScope({
        sourceUrl: "https://example.com/local/prosecutor-files-murder-charges",
        category: "explosion",
        hasActorCountries: false,
        countryCode: "GRC",
        actor1Name: null,
        actor2Name: null
      })
    ).toBe("domestic");
  });

  it("classifies residual local crime/policy URLs as domestic", () => {
    expect(
      classifyEventScope({
        sourceUrl: "https://www.birminghammail.co.uk/news/midlands-news/birmingham-schoolgirl-shot-head-ate-33520193",
        category: "explosion",
        hasActorCountries: true,
        countryCode: "GBR",
        actor1Name: "BIRMINGHAM",
        actor2Name: "UNITED KINGDOM"
      })
    ).toBe("domestic");

    expect(
      classifyEventScope({
        sourceUrl:
          "https://www.12newsnow.com/article/news/local/texas/71-texas-lawmakers-call-on-congress-to-pause-immigration-after-the-sixth-street-massacre/287-61611561-2b2a-4800-995e-a661b3ddf11c",
        category: "civilian",
        hasActorCountries: true,
        countryCode: "USA",
        actor1Name: "AUSTIN",
        actor2Name: "TEXAS"
      })
    ).toBe("domestic");
  });

  it("uses actor heuristics when actor countries are missing", () => {
    expect(
      classifyEventScope({
        sourceUrl: "https://example.com/update/story",
        category: "battle",
        hasActorCountries: false,
        countryCode: "ROU",
        actor1Name: "PROSECUTOR GENERAL",
        actor2Name: null
      })
    ).toBe("domestic");

    expect(
      classifyEventScope({
        sourceUrl: "https://example.com/update/story",
        category: "strategic",
        hasActorCountries: false,
        countryCode: "ROU",
        actor1Name: "MINISTRY OF FOREIGN AFFAIRS",
        actor2Name: null
      })
    ).toBe("policy");
  });

  it("keeps actor-country events as geopolitical when no exclusion heuristic matches", () => {
    expect(
      classifyEventScope({
        sourceUrl: "https://example.com/world/israel-strikes-iran",
        category: "explosion",
        hasActorCountries: true,
        countryCode: "IRN",
        actor1Name: "ISRAEL",
        actor2Name: "IRAN"
      })
    ).toBe("geopolitical");
  });
});
