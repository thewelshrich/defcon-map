import {
  formatDefconTimestamp,
  getDefconAccentClass,
  type DefconSummary
} from "../../domain/defcon";

type DefconIndicatorProps = {
  summary: DefconSummary;
};

export function DefconIndicator({ summary }: DefconIndicatorProps) {
  return (
    <section className={`defcon-indicator ${getDefconAccentClass(summary.level)}`}>
      <p className="defcon-kicker">GLOBAL STATUS</p>
      <h1>DEFCON {summary.level}</h1>
      <p>Trend: {summary.trend}</p>
      <p>Score: {summary.score}</p>
      <p>Updated: {formatDefconTimestamp(summary.updatedAt)}</p>
    </section>
  );
}
