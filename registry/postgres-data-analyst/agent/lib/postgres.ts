import pg from "pg";

const DEFAULT_ALLOWED_SCHEMAS = "public";
const DEFAULT_MAX_ROWS = 200;
const DEFAULT_STATEMENT_TIMEOUT_MS = 10_000;
const MIN_MAX_ROWS = 1;
const MAX_MAX_ROWS = 1_000;
const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 60_000;
const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export type DataAnalystConfig = {
  allowedSchemas: readonly string[];
  blockedTables: ReadonlySet<string>;
  databaseUrl: string | null;
  maxRows: number;
  statementTimeoutMs: number;
};

let pool: pg.Pool | null = null;
let poolDatabaseUrl: string | null = null;

export function getDataAnalystConfig(): DataAnalystConfig {
  const allowedSchemas = parseIdentifierList(
    process.env.DATA_ANALYST_ALLOWED_SCHEMAS || DEFAULT_ALLOWED_SCHEMAS,
    "DATA_ANALYST_ALLOWED_SCHEMAS",
  );

  return {
    allowedSchemas,
    blockedTables: new Set(
      parseTableList(process.env.DATA_ANALYST_BLOCKED_TABLES || ""),
    ),
    databaseUrl: process.env.DATA_ANALYST_DATABASE_URL?.trim() || null,
    maxRows: readIntegerEnv(
      "DATA_ANALYST_MAX_ROWS",
      DEFAULT_MAX_ROWS,
      MIN_MAX_ROWS,
      MAX_MAX_ROWS,
    ),
    statementTimeoutMs: readIntegerEnv(
      "DATA_ANALYST_STATEMENT_TIMEOUT_MS",
      DEFAULT_STATEMENT_TIMEOUT_MS,
      MIN_TIMEOUT_MS,
      MAX_TIMEOUT_MS,
    ),
  };
}

export function getRequiredDatabaseUrl(config: DataAnalystConfig): string {
  if (!config.databaseUrl) {
    throw new Error(
      "DATA_ANALYST_DATABASE_URL is required. Set it to a read-only Postgres connection string.",
    );
  }

  return config.databaseUrl;
}

export function getPool(config: DataAnalystConfig): pg.Pool {
  const databaseUrl = getRequiredDatabaseUrl(config);
  if (pool && poolDatabaseUrl === databaseUrl) {
    return pool;
  }

  pool = new pg.Pool({
    application_name: "postgres-data-analyst",
    connectionString: databaseUrl,
    max: 3,
  });
  poolDatabaseUrl = databaseUrl;
  return pool;
}

export function quoteIdentifier(identifier: string): string {
  if (!IDENTIFIER_PATTERN.test(identifier)) {
    throw new Error(`Invalid Postgres identifier: ${identifier}`);
  }

  return `"${identifier.replaceAll('"', '""')}"`;
}

function parseIdentifierList(value: string, envName: string): readonly string[] {
  const identifiers = value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (identifiers.length === 0) {
    throw new Error(`${envName} must include at least one schema.`);
  }

  for (const identifier of identifiers) {
    if (!IDENTIFIER_PATTERN.test(identifier)) {
      throw new Error(`${envName} contains invalid identifier "${identifier}".`);
    }
  }

  return identifiers;
}

function parseTableList(value: string): readonly string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((entry) => {
      const pieces = entry.split(".");
      if (pieces.length > 2) {
        throw new Error(`Invalid DATA_ANALYST_BLOCKED_TABLES entry "${entry}".`);
      }

      for (const piece of pieces) {
        if (!IDENTIFIER_PATTERN.test(piece)) {
          throw new Error(
            `DATA_ANALYST_BLOCKED_TABLES contains invalid identifier "${entry}".`,
          );
        }
      }

      return entry.toLowerCase();
    });
}

function readIntegerEnv(
  envName: string,
  defaultValue: number,
  min: number,
  max: number,
): number {
  const raw = process.env[envName]?.trim();
  if (!raw) {
    return defaultValue;
  }

  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${envName} must be an integer from ${min} to ${max}.`);
  }

  return value;
}
