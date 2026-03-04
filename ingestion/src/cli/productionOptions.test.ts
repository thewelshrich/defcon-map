import { describe, expect, it } from "vitest";

import { parseProductionCliOptions } from "./productionOptions";

describe("parseProductionCliOptions", () => {
  it("defaults to live publish mode", () => {
    expect(parseProductionCliOptions([])).toEqual({
      dryRun: false,
      output: ".local/ingestion-production"
    });
  });

  it("supports dry-run mode with a custom output directory", () => {
    expect(parseProductionCliOptions(["--dry-run", "--output", ".tmp/real-gdelt"])).toEqual({
      dryRun: true,
      output: ".tmp/real-gdelt"
    });
  });
});
