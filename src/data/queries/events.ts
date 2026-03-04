import { queryOptions } from "@tanstack/react-query";

import type { ConflictEvent } from "../../domain/events";

export async function fetchConflictEvents() {
  const response = await fetch("/api/events.json");

  if (!response.ok) {
    throw new Error(`Failed to load conflict events: ${response.status}`);
  }

  return (await response.json()) as ConflictEvent[];
}

export function getEventsQueryOptions() {
  return queryOptions({
    queryKey: ["conflict-events"],
    queryFn: fetchConflictEvents
  });
}
