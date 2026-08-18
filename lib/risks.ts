import type { AccessRules, Operation, Role } from "./types";

/**
 * anon and authenticated policies are generated with a `true` predicate, so
 * enabling them for a write that targets existing rows lets the caller reach
 * every row in the table, not just their own.
 */
const EXPOSED_ROLES: Role[] = ["anon", "authenticated"];
const UNSCOPED_WRITES: Operation[] = ["update", "delete"];

const SUBJECT: Record<string, string> = {
  anon: "any visitor",
  authenticated: "any signed in user",
};

const VERB: Record<string, string> = {
  update: "rewrite",
  delete: "delete",
};

export interface Risk {
  role: Role;
  op: Operation;
  message: string;
}

export function detectRisks(rules: AccessRules): Risk[] {
  const risks: Risk[] = [];
  for (const role of EXPOSED_ROLES) {
    for (const op of UNSCOPED_WRITES) {
      if (!rules[role][op]) continue;
      risks.push({
        role,
        op,
        message: `${role} ${op.toUpperCase()} has no ownership check, so ${SUBJECT[role]} can ${VERB[op]} any row in the table.`,
      });
    }
  }
  return risks;
}

export function isRisky(risks: Risk[], role: Role, op: Operation): boolean {
  return risks.some((r) => r.role === role && r.op === op);
}

export function roleRisks(risks: Risk[], role: Role): Risk[] {
  return risks.filter((r) => r.role === role);
}
