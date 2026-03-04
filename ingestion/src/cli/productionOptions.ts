export type ProductionCliOptions = {
  dryRun: boolean;
  output: string;
};

export function parseProductionCliOptions(argv: string[]): ProductionCliOptions {
  const options: ProductionCliOptions = {
    dryRun: false,
    output: ".local/ingestion-production"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--output" && next) {
      options.output = next;
      index += 1;
    }
  }

  return options;
}
