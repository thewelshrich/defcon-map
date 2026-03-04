import type { ConflictEventCategory } from "../../../src/domain/events";
import type { ExtractedGdeltRow } from "../types";

const BATTLE_CODES = new Set(["180", "181", "182", "183", "185", "186"]);
const EXPLOSION_CODES = new Set(["190", "191", "192", "193", "194", "195", "196"]);
const CIVILIAN_CODES = new Set(["200"]);
const STRATEGIC_CODES = new Set(["170", "171", "172", "173", "174", "175", "176"]);

export function mapEventCategory(row: ExtractedGdeltRow): ConflictEventCategory | null {
  const baseCode = row.EventBaseCode || row.EventCode;
  const rootCode = row.EventRootCode || row.EventCode.slice(0, 2);

  if (BATTLE_CODES.has(baseCode) || rootCode === "18") {
    return "battle";
  }

  if (EXPLOSION_CODES.has(baseCode) || rootCode === "19") {
    return "explosion";
  }

  if (CIVILIAN_CODES.has(baseCode) || rootCode === "20") {
    return "civilian";
  }

  if (STRATEGIC_CODES.has(baseCode) || rootCode === "17") {
    return "strategic";
  }

  return null;
}
