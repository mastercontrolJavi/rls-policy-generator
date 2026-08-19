# RLS Policy Generator

Row Level Security is what stands between your users and each other's data. It is also the thing nobody checks.

## What this looks like without the tool

Here is how it actually goes. You write a policy at the end of a long day. You mean to scope it to the row owner, but you are moving fast, so `USING (true)` goes in and you tell yourself you will tighten it later. The migration runs. Tests pass, because your tests use the service role key and the service role bypasses RLS entirely. The app works.

Everyone can read everyone's rows, and nothing tells you.

That failure is silent by design. Postgres did exactly what you asked. There is no error, no warning, no red build. You find out when a customer emails you, or you do not find out at all.

## Warn before generating, not after

Most tooling in this space audits after the fact. You ship, then you scan, then you fix. By the time the scan runs, the bad policy is already live.

So the warning happens while you are configuring. Turn on UPDATE for anon and the toggle goes amber immediately, the role gets a flag, and a line underneath says any visitor can rewrite any row. You see it before you have copied anything.

The same warning is written into the generated SQL as a comment, so it survives into the migration file and the next person reads it too.

The tool also refuses to generate SQL it knows is broken. Name a column `order` and you get the reason instead of a `CREATE TABLE` that fails on paste.

## Why annotation matters more than more toggles

The easy version of this product is more toggles. More roles, more operations, more knobs.

I think that is backwards. The problem was never that people cannot express the policy. It is that they cannot read it back. `USING (auth.uid() = user_id)` is precise, and it is also four tokens that all look alike at 2am.

So every generated policy carries a plain English sentence above it: "A signed in user can change a row in posts only when its user_id matches their own auth.uid(), and cannot hand the row to anyone else."

A toggle tells you what you set. A sentence tells you what you did.

Live tool: https://rls-policy-generator.vercel.app
