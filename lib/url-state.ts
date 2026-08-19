import type {
  AppState,
  Column,
  ColumnType,
  Operation,
  Role,
  Tenancy,
} from "./types";
import {
  COLUMN_TYPES,
  DEFAULT_TENANCY,
  OPERATIONS,
  ROLES,
} from "./types";
import { isSafeIdentifier } from "./validation";

/**
 * State travels in the query string so a configured policy is a link.
 *
 *   ?t=posts&c=id:uuid,title:text,user_id:uuid&r=s-s-siud
 *
 * Column names are percent-encoded individually, so a name containing the
 * `,` or `:` separators cannot break parsing. That means the raw query has
 * to be split before it is decoded, which is why this module does not hand
 * the value string to URLSearchParams.
 */

const OP_CODES: Record<Operation, string> = {
  select: "s",
  insert: "i",
  update: "u",
  delete: "d",
};

const CODE_OPS: Record<string, Operation> = {
  s: "select",
  i: "insert",
  u: "update",
  d: "delete",
};

function enc(value: string): string {
  return encodeURIComponent(value);
}

function dec(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // A hand-edited URL can carry an invalid escape sequence.
    return value;
  }
}

export function encodeState(state: AppState): string {
  const parts: string[] = [];

  parts.push(`t=${enc(state.schema.tableName)}`);

  if (state.schema.columns.length > 0) {
    const columns = state.schema.columns
      .map((c) => `${enc(c.name)}:${enc(c.type)}`)
      .join(",");
    parts.push(`c=${columns}`);
  }

  const rules = ROLES.map((role) =>
    OPERATIONS.filter((op) => state.rules[role][op])
      .map((op) => OP_CODES[op])
      .join("")
  ).join("-");
  parts.push(`r=${rules}`);

  // Only non-default tenancy is worth the URL length.
  if (state.tenancy.mode !== DEFAULT_TENANCY.mode) {
    parts.push(`m=${enc(state.tenancy.mode)}`);
  }
  if (state.tenancy.membershipTable !== DEFAULT_TENANCY.membershipTable) {
    parts.push(`mt=${enc(state.tenancy.membershipTable)}`);
  }
  if (
    state.tenancy.membershipUserColumn !== DEFAULT_TENANCY.membershipUserColumn
  ) {
    parts.push(`mu=${enc(state.tenancy.membershipUserColumn)}`);
  }
  if (
    state.tenancy.membershipOrgColumn !== DEFAULT_TENANCY.membershipOrgColumn
  ) {
    parts.push(`mo=${enc(state.tenancy.membershipOrgColumn)}`);
  }

  return parts.join("&");
}

/** Splits a query string into raw, still-encoded values. */
function rawParams(search: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of search.replace(/^\?/, "").split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const key = eq === -1 ? pair : pair.slice(0, eq);
    const value = eq === -1 ? "" : pair.slice(eq + 1);
    out[dec(key)] = value;
  }
  return out;
}

function parseColumns(raw: string): Column[] {
  if (!raw) return [];
  const columns: Column[] = [];
  raw.split(",").forEach((entry, i) => {
    if (!entry) return;
    const sep = entry.indexOf(":");
    const name = dec(sep === -1 ? entry : entry.slice(0, sep));
    const rawType = sep === -1 ? "" : dec(entry.slice(sep + 1));
    if (!name) return;
    const type = COLUMN_TYPES.includes(rawType as ColumnType)
      ? (rawType as ColumnType)
      : "text";
    // Ids are positional so a shared link produces stable React keys.
    columns.push({ id: `u${i}`, name, type });
  });
  return columns;
}

function parseRules(raw: string): AppState["rules"] {
  const segments = raw.split("-");
  const rules = {} as AppState["rules"];
  ROLES.forEach((role: Role, i) => {
    const codes = segments[i] ?? "";
    rules[role] = {
      select: false,
      insert: false,
      update: false,
      delete: false,
    };
    for (const ch of codes) {
      const op = CODE_OPS[ch];
      if (op) rules[role][op] = true;
    }
  });
  return rules;
}

/**
 * Tenancy names are interpolated straight into generated SQL, so a hand
 * crafted link must not be able to smuggle anything through them. Anything
 * that is not a bare identifier falls back to the default.
 */
function identifierParam(raw: string | undefined, fallback: string): string {
  const value = dec(raw ?? "");
  return isSafeIdentifier(value) ? value : fallback;
}

function parseTenancy(params: Record<string, string>): Tenancy {
  const mode = dec(params.m ?? "") === "org" ? "org" : "owner";
  return {
    mode,
    membershipTable: identifierParam(params.mt, DEFAULT_TENANCY.membershipTable),
    membershipUserColumn: identifierParam(
      params.mu,
      DEFAULT_TENANCY.membershipUserColumn
    ),
    membershipOrgColumn: identifierParam(
      params.mo,
      DEFAULT_TENANCY.membershipOrgColumn
    ),
  };
}

/**
 * Rebuilds state from a query string. Returns null when the URL carries
 * nothing usable, so the caller can fall back to its own default.
 */
export function decodeState(search: string): AppState | null {
  const params = rawParams(search);
  const recognised = ["t", "c", "r"].some((key) => key in params);
  if (!recognised) return null;

  return {
    schema: {
      tableName: dec(params.t ?? ""),
      columns: parseColumns(params.c ?? ""),
    },
    rules: parseRules(params.r ?? ""),
    tenancy: parseTenancy(params),
  };
}
