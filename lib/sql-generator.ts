import { predicateLines, resolveAccessCheck, scopedRoleLabel } from "./access";
import type { AccessCheck } from "./access";
import { describePolicy } from "./annotations";
import { detectRisks } from "./risks";
import type { Risk } from "./risks";
import type { AppState, Operation, Role } from "./types";
import { OPERATIONS, ROLES } from "./types";


export interface GeneratedPolicy {
  role: Role;
  op: Operation;
  name: string;
  /** Plain-English sentence describing what this policy permits. */
  annotation: string;
  /** SQL lines for the policy, comments included. */
  lines: string[];
}

export function generatePolicies(state: AppState): GeneratedPolicy[] {
  const tableName = tableNameOf(state);
  const check = resolveAccessCheck(state.schema, state.tenancy);
  const risks = detectRisks(state.rules);
  const scopedLabel = scopedRoleLabel(state.tenancy);

  const policies: GeneratedPolicy[] = [];
  for (const role of ROLES) {
    for (const op of OPERATIONS) {
      if (!state.rules[role][op]) continue;
      // The scoped role cannot produce a policy without a column to check.
      if (role === "owner" && check.kind === "none") continue;

      const label = role === "owner" ? scopedLabel : role;
      const name = `${label}_${op}_${tableName}`;
      const annotation = describePolicy(role, op, tableName, check);
      policies.push({
        role,
        op,
        name,
        annotation,
        lines: renderPolicy(tableName, role, op, name, check, annotation, risks),
      });
    }
  }
  return policies;
}

export function generateSql(state: AppState): string {
  const tableName = tableNameOf(state);
  const check = resolveAccessCheck(state.schema, state.tenancy);
  const policies = generatePolicies(state);

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

  if (check.kind === "org") {
    lines.push(
      `-- Assumes ${check.membershipTable}(${check.membershipUserColumn}, ${check.membershipOrgColumn}) already exists`
    );
    lines.push(`-- and maps each user to the orgs they belong to.`);
    lines.push("");
  }

  lines.push(`-- Enable Row Level Security`);
  lines.push(`ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;`);
  lines.push("");

  for (const policy of policies) {
    lines.push(...policy.lines);
    lines.push("");
  }

  if (policies.length === 0) {
    lines.push("-- No policies enabled. Toggle access rules to generate them.");
    if (check.kind === "none" && hasScopedRuleEnabled(state)) {
      lines.push(
        `-- The scoped role is on but no matching column was found on ${tableName}.`
      );
    }
  }

  return lines.join("\n");
}

function tableNameOf(state: AppState): string {
  return (state.schema.tableName || "my_table").trim();
}

function hasScopedRuleEnabled(state: AppState): boolean {
  return OPERATIONS.some((op) => state.rules.owner[op]);
}

function renderPolicy(
  tableName: string,
  role: Role,
  op: Operation,
  policyName: string,
  check: AccessCheck,
  annotation: string,
  risks: Risk[]
): string[] {
  const opUpper = op.toUpperCase();
  const targetRole = role === "owner" ? "authenticated" : role;
  const out: string[] = [];

  out.push(`-- ${annotation}`);
  const risk = risks.find((r) => r.role === role && r.op === op);
  if (risk) {
    out.push(`-- WARNING: ${risk.message}`);
  }

  out.push(`CREATE POLICY "${policyName}" ON ${tableName}`);
  out.push(`  FOR ${opUpper} TO ${targetRole}`);

  const scoped = role === "owner";
  const predicate = scoped ? predicateLines(check, "    ") : null;

  // INSERT is validated on the incoming row, so it only takes WITH CHECK.
  // UPDATE is validated on both the existing row and the replacement.
  if (op === "insert") {
    out.push(...clause("WITH CHECK", predicate, true));
  } else if (op === "update") {
    out.push(...clause("USING", predicate, false));
    out.push(...clause("WITH CHECK", predicate, true));
  } else {
    out.push(...clause("USING", predicate, true));
  }

  return out;
}

function clause(
  keyword: string,
  predicate: string[] | null,
  terminal: boolean
): string[] {
  const end = terminal ? ";" : "";
  if (!predicate) return [`  ${keyword} (true)${end}`];
  if (predicate.length === 1) {
    return [`  ${keyword} (${predicate[0].trim()})${end}`];
  }
  return [`  ${keyword} (`, ...predicate, `  )${end}`];
}
