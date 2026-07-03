import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  getDataAnalystConfig,
  getPool,
  quoteIdentifier,
} from "../lib/postgres";
import { trimSql, validateReadOnlySql } from "../lib/sql-policy";

type QueryColumn = {
  dataTypeId: number;
  name: string;
};

type RunSqlOutput =
  | {
      columns: QueryColumn[];
      durationMs: number;
      ok: true;
      rowCount: number;
      rows: Record<string, unknown>[];
      truncated: boolean;
    }
  | {
      error: string;
      missingEnv?: string;
      ok: false;
    };

export default defineTool({
  description:
    "Run one bounded read-only Postgres SELECT or WITH query against the configured analytics database.",
  inputSchema: z.object({
    sql: z.string().min(1).describe("A single read-only SELECT or WITH query."),
  }),
  async execute({ sql }): Promise<RunSqlOutput> {
    const startedAt = Date.now();

    try {
      const config = getDataAnalystConfig();
      if (!config.databaseUrl) {
        return {
          ok: false,
          error:
            "DATA_ANALYST_DATABASE_URL is required. Set it to a read-only Postgres connection string.",
          missingEnv: "DATA_ANALYST_DATABASE_URL",
        };
      }

      validateReadOnlySql(sql, config);

      const pool = getPool(config);
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("SET TRANSACTION READ ONLY");
        await client.query(`SET LOCAL statement_timeout = ${config.statementTimeoutMs}`);
        await client.query(
          `SET LOCAL search_path TO ${config.allowedSchemas.map(quoteIdentifier).join(", ")}`,
        );

        const result = await client.query(
          `select * from (\n${trimSql(sql)}\n) as data_analyst_result limit ${config.maxRows + 1}`,
        );
        await client.query("COMMIT");

        const rows = result.rows.slice(0, config.maxRows);
        return {
          ok: true,
          columns: result.fields.map((field) => ({
            dataTypeId: field.dataTypeID,
            name: field.name,
          })),
          durationMs: Date.now() - startedAt,
          rowCount: rows.length,
          rows,
          truncated: result.rows.length > config.maxRows,
        };
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      return { ok: false, error: formatUnknownError(error) };
    }
  },
  toModelOutput(output) {
    if (!output.ok) {
      return { type: "json", value: output };
    }

    return {
      type: "json",
      value: {
        ok: true,
        columns: output.columns.map((column) => column.name),
        durationMs: output.durationMs,
        rowCount: output.rowCount,
        rows: output.rows,
        truncated: output.truncated,
      },
    };
  },
});

function formatUnknownError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown SQL execution error.";
}
