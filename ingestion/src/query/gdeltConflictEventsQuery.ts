import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const GDELT_CONFLICT_EVENTS_QUERY_VERSION = "v1";

export async function loadGdeltConflictEventsQuery() {
  return readFile(resolve(process.cwd(), "ingestion/sql/gdelt_conflict_events_v1.sql"), "utf8");
}
