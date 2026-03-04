import type { TickerItem } from "../../app/App";
import type { DefconSummary } from "../../domain/defcon";
import type { ConflictEvent } from "../../domain/events";
import { MapView } from "../../map/MapView";
import { DefconIndicator } from "../defcon-indicator/DefconIndicator";
import { NewsTicker } from "../ticker/NewsTicker";
import { SidePanel } from "./SidePanel";

type AppShellProps = {
  events: ConflictEvent[];
  summary: DefconSummary;
  tickerItems: TickerItem[];
};

export function AppShell({ events, summary, tickerItems }: AppShellProps) {
  return (
    <div className="app-shell crt-frame">
      <div className="map-stage">
        <MapView events={events} />
      </div>
      <div className="hud-overlay">
        <DefconIndicator summary={summary} />
        <SidePanel />
        <NewsTicker items={tickerItems} />
      </div>
    </div>
  );
}
