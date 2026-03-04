import type { IngestionManifest, IngestionManifestStatus } from "../types";

export function buildManifest(args: {
  runId: string;
  queryVersion: string;
  startedAt: string;
  finishedAt: string;
  status: IngestionManifestStatus;
  sourceWindowStart: string;
  sourceWindowEnd: string;
  rowsExtracted: number;
  rowsDropped: number;
  rowsPublished: number;
  dedupeCount: number;
  bytesScanned: number;
  errorSummary?: string;
}) : IngestionManifest {
  return {
    runId: args.runId,
    startedAt: args.startedAt,
    finishedAt: args.finishedAt,
    status: args.status,
    queryVersion: args.queryVersion,
    sourceWindowStart: args.sourceWindowStart,
    sourceWindowEnd: args.sourceWindowEnd,
    rowsExtracted: args.rowsExtracted,
    rowsDropped: args.rowsDropped,
    rowsPublished: args.rowsPublished,
    dedupeCount: args.dedupeCount,
    bytesScanned: args.bytesScanned,
    publishReason: args.status === "success" ? "published-latest-snapshots" : "publish-blocked",
    errorSummary: args.errorSummary ?? null
  };
}
