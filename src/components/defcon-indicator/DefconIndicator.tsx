import {
  formatDefconTimestamp,
  getDefconAccentClass,
  type DefconSummary,
  type DefconTrend
} from "../../domain/defcon";

type DefconIndicatorProps = {
  summary: DefconSummary;
};

function getTrendArrow(trend: DefconTrend) {
  switch (trend) {
    case "up":
      return { symbol: "\u2191", label: "ESCALATING" };
    case "down":
      return { symbol: "\u2193", label: "DE-ESCALATING" };
    case "steady":
      return { symbol: "\u2192", label: "STEADY" };
  }
}

export function DefconIndicator({ summary }: DefconIndicatorProps) {
  const trend = getTrendArrow(summary.trend);

  return (
    <section className={`defcon-indicator ${getDefconAccentClass(summary.level)}`}>
      <p className="defcon-kicker">GLOBAL STATUS</p>
      <h1>DEFCON {summary.level}</h1>
      <p className="defcon-meta defcon-trend">
        {trend.symbol} {trend.label}
      </p>
      <p className="defcon-meta">INDEX {summary.score}</p>
      <p className="defcon-meta">{formatDefconTimestamp(summary.updatedAt)}</p>
    </section>
  );
}
