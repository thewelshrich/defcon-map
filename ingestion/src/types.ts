import type { DefconSummarySnapshot } from "../../src/domain/defcon";
import type { ConflictEvent, ConflictEventFeed, EventScope, PlotVisibility } from "../../src/domain/events";

export type ExtractedGdeltRow = {
  GLOBALEVENTID: string;
  SQLDATE: string | number;
  DATEADDED: string | number | null;
  EventCode: string;
  EventRootCode: string;
  EventBaseCode: string;
  QuadClass: number;
  GoldsteinScale: number;
  NumMentions: number;
  Actor1CountryCode: string | null;
  Actor2CountryCode: string | null;
  Actor1Name: string | null;
  Actor2Name: string | null;
  ActionGeo_CountryCode: string | null;
  ActionGeo_Type: number | null;
  ActionGeo_FullName: string | null;
  ActionGeo_Lat: number | null;
  ActionGeo_Long: number | null;
  SOURCEURL: string | null;
};

export type PublishedConflictEvent = ConflictEvent;

export type NormalizedConflictCandidate = PublishedConflictEvent & {
  dedupeKey: string;
  rawCountryCode: string | null;
  geoPrecision: "country" | "subnational" | "city" | "unknown";
};

export type RawGdeltSnapshot = {
  runId: string;
  queryVersion: string;
  capturedAt: string;
  sourceWindowStart: string;
  sourceWindowEnd: string;
  bytesScanned: number;
  rows: ExtractedGdeltRow[];
};

export type RawSnapshotManifest = {
  runId: string;
  rawSnapshotPath: string;
  queryVersion: string;
  capturedAt: string;
  bytesScanned: number;
};

export type ReplayRunSource = {
  type: "raw-snapshot";
  runId: string;
  snapshotPath: string;
};

export type CountrySummary = {
  countryCode: string;
  countryName: string;
  eventCount: number;
  severeEventCount: number;
  civilianImpactCount: number;
  weightedSeverity: number;
  latestEventAt: string;
};

export type IngestionManifestStatus = "success" | "failed";

export type IngestionManifest = {
  runId: string;
  startedAt: string;
  finishedAt: string;
  status: IngestionManifestStatus;
  queryVersion: string;
  sourceWindowStart: string;
  sourceWindowEnd: string;
  rowsExtracted: number;
  rowsDropped: number;
  rowsPublished: number;
  dedupeCount: number;
  bytesScanned: number;
  publishReason: string;
  errorSummary: string | null;
};

export type QueryRunResult = {
  rows: ExtractedGdeltRow[];
  bytesScanned: number;
};

export type BigQueryQueryRunner = {
  runQuery: (args: { sql: string; queryVersion: string }) => Promise<QueryRunResult>;
};

export type SnapshotStore = {
  writeJson: (path: string, value: unknown) => Promise<void>;
};

export type KeyValueStore = {
  put: (key: string, value: string) => Promise<void>;
};

export type ManifestSink = {
  write: (manifest: IngestionManifest) => Promise<void>;
};

export type IngestionRunResult = {
  eventFeed: ConflictEventFeed;
  summary: DefconSummarySnapshot;
  countrySummaries: CountrySummary[];
  manifest: IngestionManifest;
};

export type NormalizationSourceMetadata = {
  runId: string;
  queryVersion: string;
  sourceWindowStart: string;
  sourceWindowEnd: string;
  bytesScanned: number;
};
