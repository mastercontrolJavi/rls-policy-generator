import type { Column } from "./types";

const SIM_USER_ID = "7a6b9c2d-3e4f-5a6b-9c2d-3e4f5a6b9c2d";
const OTHER_USER_ID = "9f8e7d6c-5b4a-39f8-e7d6-c5b4a39f8e7d";

export const SIM_USER_DISPLAY = "7a6b…2d";

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

const OWNER_COLS = ["user_id", "owner_id", "created_by"];

function fakeValue(col: Column, rowIdx: number, isOwned: boolean): string {
  if (OWNER_COLS.includes(col.name)) {
    return (isOwned ? SIM_USER_ID : OTHER_USER_ID).slice(0, 8) + "…";
  }

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
  isOwned: boolean;
}

export function generateSampleRows(columns: Column[]): SampleRow[] {
  const ownership = [true, false, true];
  return ownership.map((isOwned, rowIdx) => {
    const cells: Record<string, string> = {};
    for (const col of columns) {
      cells[col.name] = fakeValue(col, rowIdx, isOwned);
    }
    return { cells, isOwned };
  });
}
