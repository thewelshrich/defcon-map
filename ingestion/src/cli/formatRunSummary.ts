type RunSummaryInput = {
  runId: string;
  status: string;
  rowsPublished: number;
  bytesScanned: number;
  dryRun?: boolean;
  outputDirectory?: string | null;
  finishedAt?: string;
};

function toMegabytes(bytesScanned: number) {
  const megabytes = bytesScanned / (1024 * 1024);
  return Math.round(megabytes * 10) / 10;
}

export function formatRunSummary(input: RunSummaryInput) {
  return {
    runId: input.runId,
    status: input.status,
    rowsPublished: input.rowsPublished,
    bytesScanned: input.bytesScanned,
    megabytesScanned: toMegabytes(input.bytesScanned),
    ...(input.finishedAt ? { finishedAt: input.finishedAt } : {}),
    ...(input.dryRun == null ? {} : { dryRun: input.dryRun }),
    ...(input.outputDirectory ? { outputDirectory: input.outputDirectory } : {})
  };
}
