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
    const fatalitiesText =
      event.fatalities == null ? "fatalities unknown" : `${event.fatalities} reported fatalities`;

    return {
      id: event.id,
      category: event.category,
      text: `${event.category.toUpperCase()} \u2014 ${event.countryName} (${fatalitiesText})`
    };
  });
}

export function App() {
  const { data: summary } = useQuery(getSummaryQueryOptions());
  const { data: eventFeed } = useQuery(getEventsQueryOptions());

  if (!summary || !eventFeed) {
    return <div className="app-loading">Loading strategic display...</div>;
  }

  const events = eventFeed.events;

  return <AppShell events={events} summary={summary} tickerItems={buildTickerItems(events)} />;
}
