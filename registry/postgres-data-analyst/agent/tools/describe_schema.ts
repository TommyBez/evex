import { defineTool } from "eve/tools";
import { z } from "zod";
import { getDataAnalystConfig, getPool } from "../lib/postgres";

const SCHEMA_COLUMN_LIMIT = 1_000;

type TableKind =
  | "foreign_table"
  | "materialized_view"
  | "partitioned_table"
  | "table"
  | "unknown"
  | "view";

type SchemaColumn = {
  column: string;
  dataType: string;
  nullable: boolean;
  ordinalPosition: number;
  primaryKey: boolean;
};

type SchemaTable = {
  columns: SchemaColumn[];
  kind: TableKind;
  schema: string;
  table: string;
};

type DescribeSchemaOutput =
  | {
      ok: true;
      tables: SchemaTable[];
      truncated: boolean;
    }
  | {
      error: string;
      missingEnv?: string;
      ok: false;
    };

const BLOCKED_TABLE_CONDITION = `
  not exists (
    select 1
    from unnest($3::text[]) blocked_table(name)
    where lower(c.table_name) = blocked_table.name
      or lower(c.table_schema || '.' || c.table_name) = blocked_table.name
  )
`;

export default defineTool({
  description:
    "Describe allowed Postgres schemas, tables, columns, types, nullability, and primary-key columns.",
  inputSchema: z.object({
    schema: z.string().min(1).optional(),
    table: z.string().min(1).optional(),
  }),
  async execute({ schema, table }): Promise<DescribeSchemaOutput> {
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

      if (schema && !config.allowedSchemas.includes(schema)) {
        return { ok: true, tables: [], truncated: false };
      }

      const pool = getPool(config);
      const schemas = schema ? [schema] : config.allowedSchemas;
      const result = await pool.query(
        `
          select
            c.table_schema,
            c.table_name,
            c.column_name,
            c.ordinal_position,
            c.data_type,
            c.udt_name,
            c.is_nullable,
            case cls.relkind
              when 'r' then 'table'
              when 'p' then 'partitioned_table'
              when 'v' then 'view'
              when 'm' then 'materialized_view'
              when 'f' then 'foreign_table'
              else 'unknown'
            end as relation_kind,
            tc.constraint_type = 'PRIMARY KEY' as is_primary_key
          from information_schema.columns c
          join pg_catalog.pg_namespace n
            on n.nspname = c.table_schema
          join pg_catalog.pg_class cls
            on cls.relnamespace = n.oid
            and cls.relname = c.table_name
            and cls.relkind in ('r', 'p', 'v', 'm', 'f')
          left join information_schema.key_column_usage kcu
            on kcu.table_schema = c.table_schema
            and kcu.table_name = c.table_name
            and kcu.column_name = c.column_name
          left join information_schema.table_constraints tc
            on tc.constraint_schema = kcu.constraint_schema
            and tc.constraint_name = kcu.constraint_name
            and tc.table_schema = c.table_schema
            and tc.table_name = c.table_name
            and tc.constraint_type = 'PRIMARY KEY'
          where c.table_schema = any($1)
            and ($2::text is null or c.table_name = $2)
            and ${BLOCKED_TABLE_CONDITION}
          order by c.table_schema, c.table_name, c.ordinal_position
          limit ${SCHEMA_COLUMN_LIMIT + 1}
        `,
        [schemas, table ?? null, [...config.blockedTables]],
      );

      const filteredRows = result.rows.filter(
        (row) =>
          !isBlockedTable(
            String(row.table_schema),
            String(row.table_name),
            config.blockedTables,
          ),
      );

      return {
        ok: true,
        tables: groupColumns(filteredRows),
        truncated: filteredRows.length > SCHEMA_COLUMN_LIMIT,
      };
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
        tableCount: output.tables.length,
        tables: output.tables,
        truncated: output.truncated,
      },
    };
  },
});

function groupColumns(rows: readonly Record<string, unknown>[]): SchemaTable[] {
  const tables = new Map<string, SchemaTable>();

  for (const row of rows.slice(0, SCHEMA_COLUMN_LIMIT)) {
    const schema = String(row.table_schema);
    const table = String(row.table_name);
    const key = `${schema}.${table}`;
    const existing = tables.get(key) ?? {
      schema,
      table,
      columns: [],
      kind: readRelationKind(row.relation_kind),
    };

    existing.columns.push({
      column: String(row.column_name),
      dataType: String(row.data_type ?? row.udt_name),
      nullable: row.is_nullable === "YES",
      ordinalPosition: Number(row.ordinal_position),
      primaryKey: row.is_primary_key === true,
    });
    tables.set(key, existing);
  }

  return [...tables.values()];
}

function readRelationKind(value: unknown): TableKind {
  if (
    value === "foreign_table" ||
    value === "materialized_view" ||
    value === "partitioned_table" ||
    value === "table" ||
    value === "view"
  ) {
    return value;
  }

  return "unknown";
}

function isBlockedTable(
  schema: string,
  table: string,
  blockedTables: ReadonlySet<string>,
): boolean {
  const tableName = table.toLowerCase();
  const qualifiedName = `${schema.toLowerCase()}.${tableName}`;
  return blockedTables.has(tableName) || blockedTables.has(qualifiedName);
}

function formatUnknownError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown schema inspection error.";
}
