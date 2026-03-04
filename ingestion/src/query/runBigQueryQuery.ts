import type { BigQueryQueryRunner, QueryRunResult } from "../types";

export async function runBigQueryQuery(
  queryRunner: BigQueryQueryRunner,
  sql: string,
  queryVersion: string
): Promise<QueryRunResult> {
  return queryRunner.runQuery({
    sql,
    queryVersion
  });
}
