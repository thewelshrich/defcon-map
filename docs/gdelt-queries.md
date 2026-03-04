# GDELT BigQuery Query Notes

## Purpose

GDELT is an upstream extraction source for the ingestion pipeline. The application should never consume raw BigQuery output directly.

The query in this repo is designed to feed the normalization layer under `ingestion/src/`, which produces curated snapshots for:

- `/api/events.json`
- `/api/summary.json`

## Query Source of Truth

The active query is versioned in:

- `ingestion/sql/gdelt_conflict_events_v1.sql`

The ingestion manifest records the query version (`v1`) for every pipeline run.

## Constraints

The v1 query is intentionally narrow:

- uses `gdelt-bq.gdeltv2.events_partitioned`
- filters to the last 14 days
- filters to `QuadClass = 4`
- requires valid action geocodes
- selects only fields needed by normalization

This keeps query costs bounded and preserves a stable extraction contract.

## Important Notes

- `QuadClass = 4` is still noisy and must be curated after extraction
- the query is not the product contract; the normalized snapshot schema is
- raw extraction rows are retained for replay/debugging, but only curated snapshots are published

## Operational Model

The intended execution path is:

1. scheduled Node worker loads the versioned SQL
2. BigQuery returns raw candidate rows
3. ingestion normalizes, deduplicates, and scores events
4. versioned snapshots are written to R2
5. latest snapshots are copied to KV for serving

Manual “save results to JSON and commit it” is no longer the intended workflow.
