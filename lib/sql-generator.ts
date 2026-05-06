import type { AppState, Operation, Role } from "./types";
import { OPERATIONS, ROLES } from "./types";

const OWNER_CANDIDATES = ["user_id", "owner_id", "created_by"];

export function detectOwnerColumn(
  columns: { name: string }[]
): string | null {
  for (const candidate of OWNER_CANDIDATES) {
    if (columns.find((c) => c.name === candidate)) return candidate;
  }
  return null;
}

export function generateSql(state: AppState): string {
  const tableName = (state.schema.tableName || "my_table").trim();
  const ownerColumn = detectOwnerColumn(state.schema.columns);

  const lines: string[] = [];
  lines.push(`-- RLS Policy Generator`);
  lines.push(`-- Table: ${tableName}`);
  lines.push("");

  if (state.schema.columns.length > 0) {
    lines.push(`CREATE TABLE ${tableName} (`);
    state.schema.columns.forEach((col, i) => {
      const last = i === state.schema.columns.length - 1;
      lines.push(`  ${col.name} ${col.type}${last ? "" : ","}`);
    });
    lines.push(");");
    lines.push("");
  }

  lines.push(`-- Enable Row Level Security`);
  lines.push(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`);
  lines.push("");

  let policiesGenerated = 0;
  for (const role of ROLES) {
    for (const op of OPERATIONS) {
      if (!state.rules[role][op]) continue;
      const block = renderPolicy(tableName, role, op, ownerColumn);
      lines.push(...block);
      lines.push("");
      policiesGenerated++;
    }
  }

  if (policiesGenerated === 0) {
    lines.push("-- No policies enabled. Toggle access rules to generate them.");
  }

  return lines.join("\n");
}

function renderPolicy(
  tableName: string,
  role: Role,
  op: Operation,
  ownerColumn: string | null
): string[] {
  const opUpper = op.toUpperCase();
  const policyName = `${role}_${op}_${tableName}`;
  const targetRole = role === "owner" ? "authenticated" : role;
  const out: string[] = [];

  if (role === "owner") {
    if (!ownerColumn) {
      out.push(`-- owner ${opUpper}: skipped (no owner column found)`);
      out.push(
        `-- Add a user_id, owner_id, or created_by column to enable owner policies.`
      );
      return out;
    }

    const ownerCheck = `auth.uid() = ${ownerColumn}`;
    out.push(`-- owner can ${opUpper} their own rows`);
    out.push(`CREATE POLICY "${policyName}" ON ${tableName}`);
    out.push(`  FOR ${opUpper} TO ${targetRole}`);

    if (op === "insert") {
      out.push(`  WITH CHECK (${ownerCheck});`);
    } else if (op === "update") {
      out.push(`  USING (${ownerCheck})`);
      out.push(`  WITH CHECK (${ownerCheck});`);
    } else {
      out.push(`  USING (${ownerCheck});`);
    }
    return out;
  }

  out.push(`-- ${role} can ${opUpper}`);
  out.push(`CREATE POLICY "${policyName}" ON ${tableName}`);
  out.push(`  FOR ${opUpper} TO ${targetRole}`);

  if (op === "insert") {
    out.push(`  WITH CHECK (true);`);
  } else if (op === "update") {
    out.push(`  USING (true)`);
    out.push(`  WITH CHECK (true);`);
  } else {
    out.push(`  USING (true);`);
  }
  return out;
}
