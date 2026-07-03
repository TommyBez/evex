import { parse, type Statement } from "pgsql-ast-parser";
import type { DataAnalystConfig } from "./postgres";

const ALLOWED_STATEMENT_TYPES = new Set([
  "select",
  "union",
  "union all",
  "with",
  "with recursive",
]);

const DISALLOWED_STATEMENT_TYPES = new Set([
  "alter index",
  "alter sequence",
  "alter table",
  "begin",
  "comment",
  "commit",
  "create composite type",
  "create enum",
  "create extension",
  "create function",
  "create index",
  "create materialized view",
  "create schema",
  "create sequence",
  "create table",
  "create view",
  "deallocate",
  "delete",
  "do",
  "drop function",
  "drop index",
  "drop sequence",
  "drop table",
  "drop trigger",
  "drop type",
  "insert",
  "prepare",
  "raise",
  "refresh materialized view",
  "rollback",
  "set",
  "set names",
  "set timezone",
  "show",
  "start transaction",
  "tablespace",
  "truncate table",
  "update",
  "values",
]);

type TableReference = {
  name: string;
  schema: string | null;
};

export type ValidatedSql = {
  tables: readonly TableReference[];
};

export function validateReadOnlySql(
  sql: string,
  config: DataAnalystConfig,
): ValidatedSql {
  const trimmedSql = trimSql(sql);
  let statements: Statement[];

  try {
    statements = parse(trimmedSql);
  } catch (error) {
    throw new Error(
      `SQL could not be parsed. Use a single read-only SELECT query with standard Postgres syntax. ${formatUnknownError(error)}`,
    );
  }

  if (statements.length !== 1) {
    throw new Error("Only one SQL statement is allowed.");
  }

  const [statement] = statements;
  if (!statement) {
    throw new Error("SQL query is empty.");
  }

  assertReadOnlyStatementTree(statement);

  const tables = collectPolicyTableReferences(statement);
  assertTablePolicy(tables, config);
  return { tables };
}

export function trimSql(sql: string): string {
  return sql.trim().replace(/;+$/u, "").trim();
}

function assertReadOnlyStatementTree(statement: Statement): void {
  const statementType = statement.type;
  if (!ALLOWED_STATEMENT_TYPES.has(statementType)) {
    throw new Error(`Only SELECT and WITH queries are allowed. Received ${statementType}.`);
  }

  walkAst(statement, (node) => {
    const type = readNodeType(node);
    if (type && DISALLOWED_STATEMENT_TYPES.has(type)) {
      throw new Error(`SQL statement type "${type}" is not allowed.`);
    }
  });
}

function collectPolicyTableReferences(statement: Statement): readonly TableReference[] {
  const tables: TableReference[] = [];
  collectPolicyTableReferencesFromNode(statement, tables, new Set());
  return tables;
}

function collectPolicyTableReferencesFromNode(
  value: unknown,
  tables: TableReference[],
  cteAliases: ReadonlySet<string>,
): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectPolicyTableReferencesFromNode(item, tables, cteAliases);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const node = value as Record<string, unknown>;
  const type = readNodeType(node);
  if (type === "with") {
    collectWithTableReferences(node, tables, cteAliases);
    return;
  }

  if (type === "with recursive") {
    collectWithRecursiveTableReferences(node, tables, cteAliases);
    return;
  }

  if (type === "table") {
    const table = readTableReference(node);
    if (table && !isCteReference(table, cteAliases)) {
      tables.push(table);
    }
  }

  for (const child of Object.values(node)) {
    collectPolicyTableReferencesFromNode(child, tables, cteAliases);
  }
}

function collectWithTableReferences(
  node: Record<string, unknown>,
  tables: TableReference[],
  parentCteAliases: ReadonlySet<string>,
): void {
  const ownAliases = collectBindingAliases(readArrayProperty(node, "bind"));
  for (const binding of readArrayProperty(node, "bind")) {
    const statement = readObjectProperty(binding, "statement");
    collectPolicyTableReferencesFromNode(statement, tables, parentCteAliases);
  }

  collectPolicyTableReferencesFromNode(
    readObjectProperty(node, "in"),
    tables,
    mergeSets(parentCteAliases, ownAliases),
  );
}

function collectWithRecursiveTableReferences(
  node: Record<string, unknown>,
  tables: TableReference[],
  parentCteAliases: ReadonlySet<string>,
): void {
  const alias = readNameProperty(node, "alias");
  const aliases = alias
    ? mergeSets(parentCteAliases, new Set([alias.toLowerCase()]))
    : parentCteAliases;

  collectPolicyTableReferencesFromNode(
    readObjectProperty(node, "statement"),
    tables,
    aliases,
  );
  collectPolicyTableReferencesFromNode(readObjectProperty(node, "in"), tables, aliases);
}

function collectBindingAliases(bindings: readonly unknown[]): ReadonlySet<string> {
  const aliases = new Set<string>();
  for (const binding of bindings) {
    const alias = readNameProperty(binding, "alias");
    if (alias) {
      aliases.add(alias.toLowerCase());
    }
  }

  return aliases;
}

function readTableReference(node: Record<string, unknown>): TableReference | null {
  const tableName = readObjectProperty(node, "name");
  const name = readStringProperty(tableName, "name");
  if (!name) {
    return null;
  }

  return {
    name,
    schema: readStringProperty(tableName, "schema"),
  };
}

function isCteReference(
  table: TableReference,
  cteAliases: ReadonlySet<string>,
): boolean {
  return table.schema === null && cteAliases.has(table.name.toLowerCase());
}

function mergeSets(
  first: ReadonlySet<string>,
  second: ReadonlySet<string>,
): ReadonlySet<string> {
  return new Set([...first, ...second]);
}

function assertTablePolicy(
  tables: readonly TableReference[],
  config: DataAnalystConfig,
): void {
  const allowedSchemas = new Set(
    config.allowedSchemas.map((schema) => schema.toLowerCase()),
  );

  for (const table of tables) {
    const schema = table.schema?.toLowerCase() ?? null;
    const name = table.name.toLowerCase();

    if (schema && !allowedSchemas.has(schema)) {
      throw new Error(`Schema "${table.schema}" is not allowed.`);
    }

    if (!schema && name.startsWith("pg_")) {
      throw new Error(`Unqualified Postgres catalog table "${table.name}" is not allowed.`);
    }

    const qualifiedName = schema ? `${schema}.${name}` : name;
    if (config.blockedTables.has(name) || config.blockedTables.has(qualifiedName)) {
      throw new Error(`Table "${qualifiedName}" is blocked for this agent.`);
    }
  }
}

function walkAst(value: unknown, visit: (node: Record<string, unknown>) => void): void {
  if (Array.isArray(value)) {
    for (const item of value) {
      walkAst(item, visit);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const node = value as Record<string, unknown>;
  visit(node);

  for (const child of Object.values(node)) {
    walkAst(child, visit);
  }
}

function readNodeType(node: Record<string, unknown>): string | null {
  return readStringProperty(node, "type");
}

function readArrayProperty(
  node: Record<string, unknown>,
  property: string,
): readonly unknown[] {
  const value = node[property];
  return Array.isArray(value) ? value : [];
}

function readNameProperty(
  node: unknown,
  property: string,
): string | null {
  const value = readObjectProperty(node, property);
  return readStringProperty(value, "name");
}

function readObjectProperty(
  node: unknown,
  property: string,
): Record<string, unknown> | null {
  if (!node || typeof node !== "object") {
    return null;
  }

  const value = (node as Record<string, unknown>)[property];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function readStringProperty(
  node: Record<string, unknown> | null,
  property: string,
): string | null {
  const value = node?.[property];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function formatUnknownError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown parser error.";
}
