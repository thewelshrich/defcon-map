import type { DefconSummary } from "../../domain/defcon";
import type { ConflictEvent } from "../../domain/events";
import { MapView } from "../../map/MapView";
import { DefconIndicator } from "../defcon-indicator/DefconIndicator";
import { NewsTicker } from "../ticker/NewsTicker";
import { SidePanel } from "./SidePanel";

type AppShellProps = {
  events: ConflictEvent[];
  summary: DefconSummary;
  tickerItems: string[];
};

export function AppShell({ events, summary, tickerItems }: AppShellProps) {
  return (
    <div className="app-shell crt-frame">
      <header className="app-header" role="banner">
        <DefconIndicator summary={summary} />
      </header>
      <div className="app-main">
        <main className="map-stage">
          <MapView events={events} />
        </main>
        <SidePanel />
      </div>
      <NewsTicker items={tickerItems} />
    </div>
  );
}
