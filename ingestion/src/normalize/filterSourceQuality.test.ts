import { describe, expect, it } from "vitest";

import { filterSourceQuality } from "./filterSourceQuality";

describe("filterSourceQuality", () => {
  it("blocks known low-signal entertainment and sports domains", () => {
    expect(filterSourceQuality("https://www.tmz.com/2026/03/04/story")).toBe(false);
    expect(filterSourceQuality("https://www.espn.com/nfl/news/story")).toBe(false);
  });

  it("blocks noisy URL keywords", () => {
    expect(filterSourceQuality("https://example.com/lifestyle/celebrity-gossip")).toBe(false);
    expect(filterSourceQuality("https://example.com/news/premier-league-preview")).toBe(false);
  });

  it("blocks known non-conflict path segments", () => {
    expect(filterSourceQuality("https://example.com/entertainment/movie-review")).toBe(false);
    expect(filterSourceQuality("https://example.com/sports/championship-roundup")).toBe(false);
  });

  it("keeps conflict-relevant sources", () => {
    expect(filterSourceQuality("https://example.com/world/israel-strikes-iran-missile-wave")).toBe(true);
  });
});
