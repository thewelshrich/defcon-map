export type DefconLevel = 1 | 2 | 3 | 4 | 5;
export type DefconTrend = "up" | "down" | "steady";

export type DefconSummary = {
  level: DefconLevel;
  score: number;
  trend: DefconTrend;
  updatedAt: string;
};

export type DefconSummarySnapshot = DefconSummary & {
  generatedAt: string;
  windowStart: string;
  windowEnd: string;
  source: "gdelt";
  schemaVersion: 1;
  eventCount: number;
  countryCount: number;
};

const accentClassByLevel: Record<DefconLevel, string> = {
  1: "defcon-critical",
  2: "defcon-severe",
  3: "defcon-elevated",
  4: "defcon-guarded",
  5: "defcon-normal"
};

export function getDefconAccentClass(level: DefconLevel) {
  return accentClassByLevel[level];
}

export function formatDefconTimestamp(isoTimestamp: string) {
  const date = new Date(isoTimestamp);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}
