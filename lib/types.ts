export type ColumnType =
  | "uuid"
  | "text"
  | "varchar"
  | "int4"
  | "int8"
  | "bool"
  | "timestamptz"
  | "jsonb"
  | "float8"
  | "numeric";

export const COLUMN_TYPES: ColumnType[] = [
  "uuid",
  "text",
  "varchar",
  "int4",
  "int8",
  "bool",
  "timestamptz",
  "jsonb",
  "float8",
  "numeric",
];

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
}

export interface Schema {
  tableName: string;
  columns: Column[];
}

export type Role = "anon" | "authenticated" | "owner";
export type Operation = "select" | "insert" | "update" | "delete";

export const ROLES: Role[] = ["anon", "authenticated", "owner"];
export const OPERATIONS: Operation[] = ["select", "insert", "update", "delete"];

export type AccessRules = Record<Role, Record<Operation, boolean>>;

export interface AppState {
  schema: Schema;
  rules: AccessRules;
}
