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

/**
 * How the scoped role is resolved. "owner" matches auth.uid() against a
 * column on the row. "org" matches the row's org against the caller's
 * memberships through a join table.
 */
export type TenancyMode = "owner" | "org";

export interface Tenancy {
  mode: TenancyMode;
  membershipTable: string;
  membershipUserColumn: string;
  membershipOrgColumn: string;
}

export const DEFAULT_TENANCY: Tenancy = {
  mode: "owner",
  membershipTable: "org_members",
  membershipUserColumn: "user_id",
  membershipOrgColumn: "org_id",
};

export interface AppState {
  schema: Schema;
  rules: AccessRules;
  tenancy: Tenancy;
}
