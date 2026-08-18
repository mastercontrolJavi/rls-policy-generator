import type { Schema } from "./types";

/**
 * PostgreSQL reserved key words. These cannot be used as identifiers without
 * double quoting, so a column called `order` or `user` produces SQL that
 * fails on paste.
 */
const RESERVED = new Set([
  "all", "analyse", "analyze", "and", "any", "array", "as", "asc",
  "asymmetric", "both", "case", "cast", "check", "collate", "column",
  "constraint", "create", "current_catalog", "current_date", "current_role",
  "current_time", "current_timestamp", "current_user", "default",
  "deferrable", "desc", "distinct", "do", "else", "end", "except", "false",
  "fetch", "for", "foreign", "from", "grant", "group", "having", "in",
  "initially", "intersect", "into", "lateral", "leading", "limit",
  "localtime", "localtimestamp", "not", "null", "offset", "on", "only",
  "or", "order", "placing", "primary", "references", "returning", "select",
  "session_user", "some", "symmetric", "table", "then", "to", "trailing",
  "true", "union", "unique", "user", "using", "variadic", "when", "where",
  "window", "with",
]);

/** Postgres truncates identifiers at NAMEDATALEN - 1. */
const MAX_LENGTH = 63;
const VALID_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_$]*$/;

export type IssueLevel = "error" | "warning";

export interface Issue {
  level: IssueLevel;
  /** Which input the issue belongs to. */
  field: "table" | "column";
  /** Set for column issues, so the row can highlight itself. */
  columnId?: string;
  message: string;
}

function checkIdentifier(name: string, label: string): Omit<Issue, "field" | "columnId">[] {
  const issues: Omit<Issue, "field" | "columnId">[] = [];

  if (name.trim() === "") {
    issues.push({ level: "error", message: `${label} is required.` });
    return issues;
  }

  if (name.length > MAX_LENGTH) {
    issues.push({
      level: "error",
      message: `${label} is ${name.length} characters. Postgres truncates identifiers at ${MAX_LENGTH}.`,
    });
    return issues;
  }

  if (/^[0-9]/.test(name)) {
    issues.push({
      level: "error",
      message: `${label} cannot start with a digit.`,
    });
    return issues;
  }

  if (!VALID_IDENTIFIER.test(name)) {
    issues.push({
      level: "error",
      message: `${label} can only contain letters, numbers and underscores.`,
    });
    return issues;
  }

  if (RESERVED.has(name.toLowerCase())) {
    issues.push({
      level: "error",
      message: `"${name}" is a reserved SQL keyword and needs quoting to work as ${label.toLowerCase()}.`,
    });
    return issues;
  }

  if (name !== name.toLowerCase()) {
    issues.push({
      level: "warning",
      message: `Postgres folds unquoted identifiers to lowercase, so ${name} becomes ${name.toLowerCase()}.`,
    });
  }

  return issues;
}

/** True when nothing has been defined yet, which is an empty state not an error. */
export function isSchemaEmpty(schema: Schema): boolean {
  return schema.columns.length === 0 && schema.tableName.trim() === "";
}

export function validateSchema(schema: Schema): Issue[] {
  if (isSchemaEmpty(schema)) return [];

  const issues: Issue[] = [];

  for (const issue of checkIdentifier(schema.tableName, "Table name")) {
    issues.push({ ...issue, field: "table" });
  }

  const seen = new Map<string, string>();
  for (const column of schema.columns) {
    for (const issue of checkIdentifier(column.name, "Column name")) {
      issues.push({ ...issue, field: "column", columnId: column.id });
    }

    const key = column.name.trim().toLowerCase();
    if (!key) continue;
    if (seen.has(key)) {
      issues.push({
        level: "error",
        field: "column",
        columnId: column.id,
        message: `Duplicate column name "${column.name}".`,
      });
    } else {
      seen.set(key, column.id);
    }
  }

  return issues;
}

export function errorsOf(issues: Issue[]): Issue[] {
  return issues.filter((i) => i.level === "error");
}

export function issuesForColumn(issues: Issue[], columnId: string): Issue[] {
  return issues.filter((i) => i.field === "column" && i.columnId === columnId);
}

export function issuesForTable(issues: Issue[]): Issue[] {
  return issues.filter((i) => i.field === "table");
}

export function worstLevel(issues: Issue[]): IssueLevel | null {
  if (issues.some((i) => i.level === "error")) return "error";
  if (issues.length > 0) return "warning";
  return null;
}
