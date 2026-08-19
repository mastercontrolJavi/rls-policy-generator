import type { AccessCheck } from "./access";
import { ORG_CANDIDATES, OWNER_CANDIDATES } from "./access";
import type { Column } from "./types";

const SIM_USER_ID = "7a6b9c2d-3e4f-5a6b-9c2d-3e4f5a6b9c2d";
const OTHER_USER_ID = "9f8e7d6c-5b4a-39f8-e7d6-c5b4a39f8e7d";
const SIM_ORG_ID = "1c4d5e6f-2a3b-4c5d-6e7f-8a9b0c1d2e3f";
const OTHER_ORG_ID = "5e2f8a71-9b0c-4d3e-8f7a-6b5c4d3e2f1a";

export const SIM_USER_DISPLAY = "7a6b…2d";
export const SIM_ORG_DISPLAY = "1c4d…3f";

const TITLES = ["Hello world", "Welcome", "Roadmap"];
const NAMES = ["Acme widget", "Globex pro", "Initech kit"];
const BODIES = ["Lorem ipsum dolor.", "First post.", "Public notice."];

function fakeUuid(seed: number): string {
  const hex = "abcdef0123456789";
  let s = "";
  let x = seed * 9301 + 49297;
  for (let i = 0; i < 8; i++) {
    x = (x * 16807) % 2147483647;
    s += hex[x % 16];
  }
  return `${s}…`;
}

function short(id: string): string {
  return `${id.slice(0, 8)}…`;
}

function fakeValue(
  col: Column,
  rowIdx: number,
  inScope: boolean,
  check: AccessCheck
): string {
  // The column the policy actually checks decides whether the row is in scope.
  if (check.column && col.name === check.column) {
    if (check.kind === "org") {
      return short(inScope ? SIM_ORG_ID : OTHER_ORG_ID);
    }
    return short(inScope ? SIM_USER_ID : OTHER_USER_ID);
  }

  // Other identity columns still read as ids, they just do not gate access.
  if (OWNER_CANDIDATES.includes(col.name)) return short(OTHER_USER_ID);
  if (ORG_CANDIDATES.includes(col.name)) return short(OTHER_ORG_ID);

  switch (col.type) {
    case "uuid":
      return fakeUuid(rowIdx + col.name.length);
    case "text":
    case "varchar": {
      if (col.name.includes("title")) return TITLES[rowIdx % 3];
      if (col.name === "name") return NAMES[rowIdx % 3];
      if (
        col.name.includes("message") ||
        col.name.includes("body") ||
        col.name.includes("content")
      ) {
        return BODIES[rowIdx % 3];
      }
      return TITLES[rowIdx % 3];
    }
    case "int4":
    case "int8":
      return String((rowIdx + 1) * 17);
    case "bool":
      return rowIdx % 2 === 0 ? "true" : "false";
    case "timestamptz":
      return `2026-${String((rowIdx % 12) + 1).padStart(2, "0")}-15`;
    case "jsonb":
      return `{"k":"v"}`;
    case "float8":
    case "numeric":
      return ((rowIdx + 1) * 12.5).toFixed(2);
    default:
      return "—";
  }
}

export interface SampleRow {
  cells: Record<string, string>;
  /** True when the simulated caller passes the scoped-role check for this row. */
  inScope: boolean;
}

export function generateSampleRows(
  columns: Column[],
  check: AccessCheck
): SampleRow[] {
  const scoping = [true, false, true];
  return scoping.map((inScope, rowIdx) => {
    const cells: Record<string, string> = {};
    for (const col of columns) {
      cells[col.name] = fakeValue(col, rowIdx, inScope, check);
    }
    return { cells, inScope };
  });
}
