# Data Pipeline

## Overview

The data pipeline treats GDELT as an upstream signal source and publishes only app-owned curated snapshots.

### Stages

1. **Extract**
   - load `ingestion/sql/gdelt_conflict_events_v1.sql`
   - run the query against `events_partitioned`

2. **Normalize**
   - map supported CAMEO conflict codes into product categories
   - resolve geography from `ActionGeo_*` only
   - classify event scope and plot visibility
   - derive confidence and severity
   - deduplicate visible markers by article-plus-map semantics

3. **Summarize**
   - build country summaries
   - compute the DEFCON index and trend over the configured 3-day public window

4. **Publish**
   - write immutable snapshots into R2
   - update `latest/*` objects
   - mirror latest snapshots into KV

## Snapshot Contracts

### Event Feed

`/api/events.json` now serves an envelope with metadata plus the published event list.

### Summary Snapshot

`/api/summary.json` now serves the DEFCON snapshot plus freshness and source metadata.

## Failure Model

If an ingestion run fails validation or publishing:

- the run is recorded as failed in the manifest
- the last successful snapshot remains live
- the frontend continues serving the previous good data

## Current Implementation Scope

The repo now contains:

- versioned SQL
- normalization and scoring logic
- summary builders
- snapshot publishing ports
- an ingestion orchestrator

Concrete production wiring for a hosted cron, BigQuery credentials, and Cloudflare account secrets still needs environment-specific deployment setup.

The repo now also includes concrete production adapters for:

- Google BigQuery query execution
- Cloudflare R2 snapshot writes
- Cloudflare KV latest-key writes

## Local Testing

You can exercise the full ingestion flow locally without BigQuery, R2, or KV by using the fixture-backed runner:

```bash
npm run ingest:local
```

This command:

- reads `ingestion/fixtures/gdelt-sample.json`
- runs the ingestion pipeline
- writes snapshot artifacts under `.local/ingestion`

To also overwrite the local app fixtures for manual UI testing:

```bash
npm run ingest:local -- --sync-public-api
```

That will update:

- `public/api/events.json`
- `public/api/summary.json`

To inspect the latest local ingestion state:

```bash
npm run ingest:status
```

This reads `.local/ingestion/r2/latest/manifest.json` and prints a compact health summary.

To replay normalization from a previously captured raw snapshot without querying BigQuery:

```bash
npm run ingest:replay -- --run-id 20260304-134634929
```

By default this:

- reads raw input from `.local/ingestion-production`
- writes replayed outputs to `.local/ingestion-replay`
- skips BigQuery entirely

Useful optional flags:

- `--source <dir>`
- `--output <dir>`
- `--sync-public-api`
- `--no-kv`

## Production Runtime

The production ingestion entrypoint is:

```bash
npm run ingest:production
```

To safely test real BigQuery data without writing to Cloudflare, use:

```bash
npm run ingest:production -- --dry-run
```

This will:

- use real BigQuery credentials
- query the live upstream source
- write outputs locally under `.local/ingestion-production`
- avoid writing to real R2 or KV

You can override the dry-run output path with:

```bash
npm run ingest:production -- --dry-run --output .tmp/real-gdelt
```

Required environment variables:

- `GCP_PROJECT_ID`
- `GCP_BIGQUERY_LOCATION`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_R2_BUCKET`
- `CLOUDFLARE_R2_ACCESS_KEY_ID`
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_KV_NAMESPACE_ID`
- `CLOUDFLARE_API_TOKEN`

The command uses the same core orchestration path as local runs, but swaps in the real cloud adapters.

Optional production environment variable:

- `INGEST_MANIFEST_WEBHOOK_URL`

If set, the production command will post the final ingestion manifest to that webhook after a successful run.

### Retry Behavior

The concrete production adapters now use a shared exponential backoff helper:

- default retry count: 2
- default delays: 100ms, then 200ms

This is applied to:

- BigQuery job creation and result fetches
- Cloudflare KV writes
- Cloudflare R2 object writes

### Structured Logs and Manifest Sinks

- local runs emit newline-delimited JSON logs to stdout and append manifests to `.local/ingestion/manifests.ndjson`
- local status reads the latest manifest from the generated snapshot directory
- production runs emit the same structured logs and can optionally publish the manifest to a webhook
