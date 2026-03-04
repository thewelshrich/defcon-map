import { describe, expect, it } from "vitest";

import { loadGdeltConflictEventsQuery } from "./gdeltConflictEventsQuery";

describe("loadGdeltConflictEventsQuery", () => {
  it("loads the versioned SQL with the required partition and conflict filters", async () => {
    const sql = await loadGdeltConflictEventsQuery();

    expect(sql).toContain("gdelt-bq.gdeltv2.events_partitioned");
    expect(sql).toContain("DATEADDED");
    expect(sql).toContain("EventRootCode");
    expect(sql).toContain("EventBaseCode");
    expect(sql).toContain("ActionGeo_Type");
    expect(sql).toContain("_PARTITIONDATE >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)");
    expect(sql).toContain("QuadClass = 4");
    expect(sql).toContain("ActionGeo_Lat IS NOT NULL");
    expect(sql).toContain("ActionGeo_Long IS NOT NULL");
  });
});
