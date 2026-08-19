import type { Operation, Role } from "./types";

export interface Explainer {
  title: string;
  body: string;
  /** Optional literal shown in mono under the body. */
  example?: string;
}

export const ROLE_HELP: Record<Role, Explainer> = {
  anon: {
    title: "anon",
    body: "Anyone using your app without signing in. Supabase gives every visitor this role until they log in, so anything you grant anon is effectively public to the internet.",
  },
  authenticated: {
    title: "authenticated",
    body: "Any user who has signed in, whoever they are. This is not the same as the person who owns the row. A rule here applies equally to every logged in user, including people looking at someone else's data.",
  },
  owner: {
    title: "owner",
    body: "The signed in user the row belongs to. Supabase exposes the caller's id as auth.uid(), and this tool compares it against an ownership column on the row.",
    example: "auth.uid() = user_id",
  },
};

/** Replaces the owner entry when the table is scoped by organisation. */
export const MEMBER_HELP: Explainer = {
  title: "member",
  body: "A signed in user who belongs to the same organisation as the row. Instead of matching one id, the policy looks the caller up in a membership table and checks the row's org against that list.",
  example: "org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())",
};

export const OP_HELP: Record<Operation, Explainer> = {
  select: {
    title: "SELECT: reading rows",
    body: "Controls which rows a query can see. With RLS on and no SELECT policy, queries succeed but come back empty rather than failing, which is why missing read access often looks like a bug in your app instead of a permissions problem.",
  },
  insert: {
    title: "INSERT: creating rows",
    body: "Controls which rows can be created. Postgres checks the row being written with WITH CHECK, so a scoped INSERT policy is what stops someone creating a row under someone else's name.",
  },
  update: {
    title: "UPDATE: changing rows",
    body: "Checked twice. USING decides which existing rows the caller may target, and WITH CHECK decides what those rows are allowed to become. Both matter: without the second, a caller could edit their own row into someone else's.",
  },
  delete: {
    title: "DELETE: removing rows",
    body: "Controls which rows can be deleted. Only USING applies, since there is no new row to validate. This is the rule most worth scoping, because a mistake here is not recoverable from the client side.",
  },
};

export const PANEL_HELP: Record<string, Explainer> = {
  schema: {
    title: "Schema",
    body: "Describe the table you want to protect. Only the column names and types matter here, and the tool watches for one that identifies the owner of each row. Names are checked against Postgres rules as you type.",
  },
  access: {
    title: "Access Rules",
    body: "Turn on what each role is allowed to do. Every switch you turn on becomes one policy in the SQL. Anything left off is denied, because RLS denies by default once it is enabled.",
  },
  preview: {
    title: "Row Preview",
    body: "Three sample rows, two owned by the simulated user and one owned by somebody else. Each row shows what every role could do to that specific row under your current rules, so you can see the effect before you ship it.",
  },
  sql: {
    title: "SQL Output",
    body: "The migration this configuration produces. Every policy carries a plain English comment saying what it permits, so the explanation travels with the SQL into your project.",
  },
};

export const SCOPE_HELP: Explainer = {
  title: "Row scope",
  body: "How the tool decides whether a row belongs to the caller. Owner matches a single id column against auth.uid(). Org matches the row's organisation against the ones the caller belongs to, which is the pattern you want for team or workspace apps.",
};

export interface GuideBlock {
  kind: "p" | "code" | "list" | "note";
  text?: string;
  items?: string[];
}

export interface GuideSection {
  id: string;
  title: string;
  blocks: GuideBlock[];
}

export const GUIDE: GuideSection[] = [
  {
    id: "what",
    title: "What Row Level Security is",
    blocks: [
      {
        kind: "p",
        text: "Normally your backend decides who can see what. Supabase lets the browser talk to the database directly, so that check has to live in the database itself. Row Level Security is how Postgres does it: rules attached to a table that decide, row by row, what each caller is allowed to do.",
      },
      {
        kind: "p",
        text: "Once you switch RLS on for a table, everything is denied until you write a policy allowing it. That default is the useful part. The dangerous part is what happens when you write the policy too loosely.",
      },
      {
        kind: "code",
        text: "ALTER TABLE posts ENABLE ROW LEVEL SECURITY;",
      },
    ],
  },
  {
    id: "silent",
    title: "Why mistakes here are silent",
    blocks: [
      {
        kind: "p",
        text: "A policy that is too permissive throws no error. Postgres does exactly what you asked. Your app works, your tests pass, and everyone can read everyone else's rows.",
      },
      {
        kind: "note",
        text: "Tests often miss this because the service role key bypasses RLS completely. If your test suite uses it, it is not testing your policies at all.",
      },
      {
        kind: "p",
        text: "That is what this tool is for. It shows you what each rule actually permits, in plain English, and flags the combinations that expose every row, before you copy anything.",
      },
    ],
  },
  {
    id: "roles",
    title: "The three roles",
    blocks: [
      {
        kind: "p",
        text: "Every request to your database arrives as one of these. The tool lets you set rules for each independently.",
      },
      {
        kind: "list",
        items: [
          "anon: not signed in. Anything you grant here is public to the internet.",
          "authenticated: signed in, but not necessarily the person the row belongs to. This is the one people get wrong, because it feels safe and is not.",
          "owner: signed in and matching the row. This is where a check gets added comparing the row against auth.uid().",
        ],
      },
      {
        kind: "note",
        text: "Postgres combines policies for the same command with OR, so a signed in owner gets both the authenticated rules and the owner rules. Granting authenticated more than you meant to cannot be walked back by the owner row.",
      },
    ],
  },
  {
    id: "operations",
    title: "The four operations",
    blocks: [
      {
        kind: "list",
        items: [
          "SELECT reads rows. Denied reads come back empty rather than failing.",
          "INSERT creates rows.",
          "UPDATE changes existing rows.",
          "DELETE removes rows.",
        ],
      },
      {
        kind: "p",
        text: "You grant these per role. Leaving one off is a decision, not an omission: with RLS enabled, anything without a policy is refused.",
      },
    ],
  },
  {
    id: "ownership",
    title: "auth.uid() and ownership",
    blocks: [
      {
        kind: "p",
        text: "auth.uid() is the id of whoever is making the request, supplied by Supabase Auth. To scope a row to its owner you need a column on the table holding that same id. This tool looks for user_id, owner_id or created_by and wires it up automatically.",
      },
      {
        kind: "code",
        text: "CREATE POLICY \"owner_select_posts\" ON posts\n  FOR SELECT TO authenticated\n  USING (auth.uid() = user_id);",
      },
      {
        kind: "p",
        text: "Without such a column the owner rules cannot be expressed, and the tool will tell you rather than quietly skipping them.",
      },
    ],
  },
  {
    id: "using",
    title: "USING and WITH CHECK",
    blocks: [
      {
        kind: "p",
        text: "These two look interchangeable and are not. Mixing them up is the most common way a policy ends up weaker than intended.",
      },
      {
        kind: "list",
        items: [
          "USING filters rows that already exist. It applies to SELECT, UPDATE and DELETE.",
          "WITH CHECK validates the row you are writing. It applies to INSERT and UPDATE.",
        ],
      },
      {
        kind: "p",
        text: "UPDATE needs both. USING alone lets a caller edit their own row into something they should not own. The tool always emits both for UPDATE so you cannot forget.",
      },
    ],
  },
  {
    id: "org",
    title: "Teams and organisations",
    blocks: [
      {
        kind: "p",
        text: "If your rows belong to a workspace rather than one person, switch Row scope to org. Instead of matching a single id, the policy checks whether the row's organisation is one the caller belongs to, looked up through a membership table.",
      },
      {
        kind: "code",
        text: "USING (\n  org_id IN (\n    SELECT org_id FROM org_members WHERE user_id = auth.uid()\n  )\n);",
      },
      {
        kind: "note",
        text: "This assumes a membership table already exists mapping users to organisations. The generated SQL says so rather than inventing one for you.",
      },
    ],
  },
  {
    id: "ship",
    title: "Running the SQL",
    blocks: [
      {
        kind: "p",
        text: "Copy the output, then in your Supabase project open SQL Editor in the left sidebar, start a new query, paste, and run it. For anything real, save it as a migration file under supabase/migrations instead so the change is tracked.",
      },
      {
        kind: "note",
        text: "The output starts with CREATE TABLE for reference. If your table already exists, delete that block before running, or Postgres will stop there.",
      },
      {
        kind: "p",
        text: "Policy names have to be unique per table. If you are replacing existing policies, drop them first with DROP POLICY \"name\" ON table, otherwise the new ones will be rejected as duplicates.",
      },
    ],
  },
  {
    id: "checklist",
    title: "Before you ship",
    blocks: [
      {
        kind: "list",
        items: [
          "Read the plain English comment above each policy. If any sentence surprises you, that is the bug.",
          "Check nothing is amber. Amber means a role can reach rows that are not theirs.",
          "Look at the middle row in Row Preview, the one owned by somebody else. Anything lit up there is access to another user's data.",
          "Confirm RLS is actually enabled on the table. Policies on a table without RLS do nothing at all.",
          "Test with a real signed in user, not the service role key, which ignores policies entirely.",
        ],
      },
    ],
  },
];
