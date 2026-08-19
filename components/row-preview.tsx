"use client";

import { Rows3 } from "lucide-react";
import type { AccessCheck } from "@/lib/access";
import { scopedRoleLabel } from "@/lib/access";
import { detectRisks, isRisky } from "@/lib/risks";
import {
  generateSampleRows,
  SIM_ORG_DISPLAY,
  SIM_USER_DISPLAY,
} from "@/lib/sample-data";
import type { AccessRules, Operation, Role, Schema, Tenancy } from "@/lib/types";
import { OPERATIONS, ROLES } from "@/lib/types";
import { PANEL_HELP } from "@/lib/help";
import { cn } from "@/lib/utils";
import { EmptyState } from "./ui/empty-state";
import { Panel } from "./ui/panel";

interface Props {
  schema: Schema;
  rules: AccessRules;
  check: AccessCheck;
  tenancy: Tenancy;
}

const OP_LABELS: Record<Operation, string> = {
  select: "S",
  insert: "I",
  update: "U",
  delete: "D",
};

/**
 * What the simulated caller can do to this specific row under each role's
 * policies. anon and authenticated policies use a `true` predicate, so they
 * apply to every row. The scoped role only applies when the row passes its
 * check.
 */
function accessFor(
  role: Role,
  rules: AccessRules,
  inScope: boolean,
  check: AccessCheck
): Record<Operation, boolean> {
  const granted = rules[role];
  if (role !== "owner") return granted;

  const reachable = check.kind !== "none" && inScope;
  return {
    select: granted.select && reachable,
    insert: granted.insert && reachable,
    update: granted.update && reachable,
    delete: granted.delete && reachable,
  };
}

export function RowPreview({ schema, rules, check, tenancy }: Props) {
  const scopedLabel = scopedRoleLabel(tenancy);

  if (schema.columns.length === 0) {
    return (
      <Panel title="Row Preview" subtitle="Visual access map" help={PANEL_HELP.preview}>
        <EmptyState
          icon={<Rows3 className="h-4 w-4" />}
          title="No rows to simulate"
          body="Add columns to the schema and sample rows will appear here, showing what each role can do to them."
        />
      </Panel>
    );
  }

  const rows = generateSampleRows(schema.columns, check);
  const visibleCols = schema.columns.slice(0, 3);
  const simulating =
    check.kind === "org"
      ? `member of org ${SIM_ORG_DISPLAY}`
      : `auth.uid() = ${SIM_USER_DISPLAY}`;

  return (
    <Panel title="Row Preview" subtitle="Visual access map" help={PANEL_HELP.preview}>
      <div className="p-4">
        <div className="mb-3 text-[11px] text-zinc-500">
          Simulating{" "}
          <span className="font-mono text-[#3ECF8E]">{simulating}</span>
        </div>

        <div className="space-y-2">
          {rows.map((row, idx) => (
            <RowCard
              key={idx}
              cells={row.cells}
              visibleCols={visibleCols}
              inScope={row.inScope}
              rules={rules}
              check={check}
              scopedLabel={scopedLabel}
            />
          ))}
        </div>

        <p className="mt-3 text-[10px] leading-relaxed text-zinc-600">
          S, I, U and D are SELECT, INSERT, UPDATE and DELETE on that row. A
          signed in {scopedLabel} gets both the auth and {scopedLabel} policies,
          since Postgres ORs policies for the same command.
        </p>
      </div>
    </Panel>
  );
}

interface RowCardProps {
  cells: Record<string, string>;
  visibleCols: { name: string }[];
  inScope: boolean;
  rules: AccessRules;
  check: AccessCheck;
  scopedLabel: string;
}

function RowCard({
  cells,
  visibleCols,
  inScope,
  rules,
  check,
  scopedLabel,
}: RowCardProps) {
  const risks = detectRisks(rules);

  return (
    <div
      className={cn(
        "sunken relative overflow-hidden rounded-lg border p-2.5 transition-colors duration-300",
        inScope ? "border-[#3ECF8E]/25" : "border-[#1f1f23]"
      )}
    >
      {inScope && check.kind !== "none" && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#3ECF8E]/70 to-transparent"
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-0.5 font-mono text-[11px]">
          {visibleCols.map((col) => (
            <div key={col.name} className="flex items-center gap-2">
              <span className="w-14 shrink-0 truncate text-zinc-600">
                {col.name}
              </span>
              <span className="truncate text-zinc-300">{cells[col.name]}</span>
            </div>
          ))}
        </div>
        {inScope && check.kind !== "none" && (
          <span className="shrink-0 rounded border border-[#3ECF8E]/25 bg-[#3ECF8E]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#3ECF8E]">
            {check.kind === "org" ? "in org" : "owned"}
          </span>
        )}
      </div>

      <div className="mt-2 space-y-1 border-t border-[#1f1f23] pt-2">
        {ROLES.map((role) => {
          const access = accessFor(role, rules, inScope, check);
          const label =
            role === "owner"
              ? scopedLabel
              : role === "authenticated"
                ? "auth"
                : role;
          return (
            <div key={role} className="flex items-center gap-2">
              <span
                className={cn(
                  "w-12 shrink-0 truncate font-mono text-[10px]",
                  role === "owner" ? "text-[#3ECF8E]/80" : "text-zinc-500"
                )}
              >
                {label}
              </span>
              <div className="flex flex-1 gap-1">
                {OPERATIONS.map((op) => (
                  <OpChip
                    key={op}
                    label={OP_LABELS[op]}
                    allowed={access[op]}
                    risky={access[op] && isRisky(risks, role, op)}
                    title={`${label} ${op.toUpperCase()}: ${
                      access[op] ? "allowed" : "denied"
                    }`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OpChip({
  label,
  allowed,
  risky,
  title,
}: {
  label: string;
  allowed: boolean;
  risky: boolean;
  title: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "flex h-4 flex-1 items-center justify-center rounded border font-mono text-[9px] font-semibold",
        "transition-all duration-300",
        allowed &&
          !risky &&
          "border-[#3ECF8E]/40 bg-[#3ECF8E]/[0.13] text-[#3ECF8E] shadow-[0_0_10px_-3px_rgba(62,207,142,0.6)]",
        allowed &&
          risky &&
          "border-amber-500/50 bg-amber-500/[0.13] text-amber-300 shadow-[0_0_10px_-3px_rgba(245,158,11,0.6)]",
        !allowed && "border-[#1f1f23] bg-transparent text-zinc-700"
      )}
    >
      {label}
    </span>
  );
}
