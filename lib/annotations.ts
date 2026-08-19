import type { AccessCheck } from "./access";
import type { Operation, Role } from "./types";

const ANON: Record<Operation, (t: string) => string> = {
  select: (t) => `Anyone on the internet can read every row in ${t}, signed in or not.`,
  insert: (t) => `Anyone on the internet can create rows in ${t}, with no check on what they put in them.`,
  update: (t) => `Anyone on the internet can change any row in ${t}, including rows they did not create.`,
  delete: (t) => `Anyone on the internet can delete any row in ${t}, including rows they did not create.`,
};

const AUTHENTICATED: Record<Operation, (t: string) => string> = {
  select: (t) => `Any signed in user can read every row in ${t}, including rows that belong to other users.`,
  insert: (t) => `Any signed in user can create rows in ${t}, with no check on what they put in them.`,
  update: (t) => `Any signed in user can change any row in ${t}, including rows that belong to other users.`,
  delete: (t) => `Any signed in user can delete any row in ${t}, including rows that belong to other users.`,
};

const OWNED: Record<Operation, (t: string, c: string) => string> = {
  select: (t, c) => `A signed in user can read a row in ${t} only when its ${c} matches their own auth.uid().`,
  insert: (t, c) => `A signed in user can create a row in ${t} only when they set ${c} to their own auth.uid().`,
  update: (t, c) => `A signed in user can change a row in ${t} only when its ${c} matches their own auth.uid(), and cannot hand the row to anyone else.`,
  delete: (t, c) => `A signed in user can delete a row in ${t} only when its ${c} matches their own auth.uid().`,
};

const ORG_SCOPED: Record<Operation, (t: string, c: string, m: string) => string> = {
  select: (t, c, m) => `A signed in user can read a row in ${t} only when its ${c} is an org they belong to in ${m}.`,
  insert: (t, c, m) => `A signed in user can create a row in ${t} only when they set ${c} to an org they belong to in ${m}.`,
  update: (t, c, m) => `A signed in user can change a row in ${t} only when its ${c} is an org they belong to in ${m}, and can move it to any other org they also belong to.`,
  delete: (t, c, m) => `A signed in user can delete a row in ${t} only when its ${c} is an org they belong to in ${m}.`,
};

/** One plain-English sentence describing exactly what a policy permits. */
export function describePolicy(
  role: Role,
  op: Operation,
  tableName: string,
  check: AccessCheck
): string {
  if (role === "anon") return ANON[op](tableName);
  if (role === "authenticated") return AUTHENTICATED[op](tableName);

  const column = check.column ?? "the owner column";
  if (check.kind === "org") {
    return ORG_SCOPED[op](tableName, column, check.membershipTable);
  }
  return OWNED[op](tableName, column);
}
