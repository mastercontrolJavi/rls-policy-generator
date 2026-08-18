import type { Column, Schema, Tenancy } from "./types";

export const OWNER_CANDIDATES = ["user_id", "owner_id", "created_by"];
export const ORG_CANDIDATES = [
  "org_id",
  "tenant_id",
  "organization_id",
  "account_id",
];

export type AccessCheckKind = "owner" | "org" | "none";

export interface AccessCheck {
  kind: AccessCheckKind;
  /** Column on the row the check is evaluated against, null when unresolved. */
  column: string | null;
  membershipTable: string;
  membershipUserColumn: string;
  membershipOrgColumn: string;
}

function findColumn(columns: Column[], candidates: string[]): string | null {
  for (const candidate of candidates) {
    if (columns.some((c) => c.name === candidate)) return candidate;
  }
  return null;
}

export function detectOwnerColumn(columns: Column[]): string | null {
  return findColumn(columns, OWNER_CANDIDATES);
}

export function detectOrgColumn(columns: Column[]): string | null {
  return findColumn(columns, ORG_CANDIDATES);
}

export function resolveAccessCheck(
  schema: Schema,
  tenancy: Tenancy
): AccessCheck {
  const membership = {
    membershipTable: tenancy.membershipTable,
    membershipUserColumn: tenancy.membershipUserColumn,
    membershipOrgColumn: tenancy.membershipOrgColumn,
  };

  if (tenancy.mode === "org") {
    const column = detectOrgColumn(schema.columns);
    return { kind: column ? "org" : "none", column, ...membership };
  }

  const column = detectOwnerColumn(schema.columns);
  return { kind: column ? "owner" : "none", column, ...membership };
}

/** SQL predicate for the scoped role, rendered as one or more indented lines. */
export function predicateLines(check: AccessCheck, indent: string): string[] {
  if (check.kind === "owner" && check.column) {
    return [`${indent}auth.uid() = ${check.column}`];
  }
  if (check.kind === "org" && check.column) {
    return [
      `${indent}${check.column} IN (`,
      `${indent}  SELECT ${check.membershipOrgColumn} FROM ${check.membershipTable} WHERE ${check.membershipUserColumn} = auth.uid()`,
      `${indent})`,
    ];
  }
  return [];
}

/** Single-line form of the same predicate, for the compact UI readout. */
export function predicateSummary(check: AccessCheck): string | null {
  if (check.kind === "owner" && check.column) {
    return `auth.uid() = ${check.column}`;
  }
  if (check.kind === "org" && check.column) {
    return `${check.column} IN (SELECT ${check.membershipOrgColumn} FROM ${check.membershipTable} WHERE ${check.membershipUserColumn} = auth.uid())`;
  }
  return null;
}

/** The scoped role is an owner in owner mode and an org member in org mode. */
export function scopedRoleLabel(tenancy: Tenancy): string {
  return tenancy.mode === "org" ? "member" : "owner";
}

/** Columns to look for when the scoped role cannot be resolved. */
export function missingColumnCandidates(tenancy: Tenancy): string[] {
  return tenancy.mode === "org" ? ORG_CANDIDATES : OWNER_CANDIDATES;
}
