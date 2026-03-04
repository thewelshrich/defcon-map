import { useQuery } from "@tanstack/react-query";

import { AppShell } from "../components/layout/AppShell";
import type { ConflictEvent } from "../domain/events";
import { getEventsQueryOptions } from "../data/queries/events";
import { getSummaryQueryOptions } from "../data/queries/summary";

export type TickerItem = {
  id: string;
  category: ConflictEvent["category"];
  text: string;
};

function buildTickerItems(events: ConflictEvent[]): TickerItem[] {
  return events.slice(0, 8).map((event) => {
    const fatalities = event.fatalities ?? 0;
    return {
      id: event.id,
      category: event.category,
      text: `${event.category.toUpperCase()} \u2014 ${event.countryName} (${fatalities} reported fatalities)`
    };
  });
}

export function App() {
  const { data: summary } = useQuery(getSummaryQueryOptions());
  const { data: events } = useQuery(getEventsQueryOptions());

  if (!summary || !events) {
    return <div className="app-loading">Loading strategic display...</div>;
  }

  return <AppShell events={events} summary={summary} tickerItems={buildTickerItems(events)} />;
}
