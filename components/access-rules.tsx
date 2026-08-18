"use client";

import { AlertTriangle, Info } from "lucide-react";
import type { AccessCheck } from "@/lib/access";
import { missingColumnCandidates, predicateSummary, scopedRoleLabel } from "@/lib/access";
import { detectRisks, isRisky, roleRisks } from "@/lib/risks";
import type { AccessRules as AccessRulesType, Operation, Role, Tenancy } from "@/lib/types";
import { OPERATIONS, ROLES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Panel } from "./ui/panel";

interface Props {
  rules: AccessRulesType;
  check: AccessCheck;
  tenancy: Tenancy;
  onChange: (rules: AccessRulesType) => void;
  onTenancyModeChange: (mode: Tenancy["mode"]) => void;
}

const ROLE_HINTS: Record<Role, string> = {
  anon: "Public, unauthenticated visitors",
  authenticated: "Any signed-in user",
  owner: "Callers who pass the row scope check below",
};

const OP_LABELS: Record<Operation, string> = {
  select: "S",
  insert: "I",
  update: "U",
  delete: "D",
};

export function AccessRules({
  rules,
  check,
  tenancy,
  onChange,
  onTenancyModeChange,
}: Props) {
  const risks = detectRisks(rules);
  const scopedLabel = scopedRoleLabel(tenancy);
  const scopeUnresolved = check.kind === "none";
  const predicate = predicateSummary(check);

  const roleLabel = (role: Role) =>
    role === "owner" ? scopedLabel : role === "authenticated" ? "auth" : role;

  const toggle = (role: Role, op: Operation) => {
    onChange({
      ...rules,
      [role]: { ...rules[role], [op]: !rules[role][op] },
    });
  };

  return (
    <Panel title="Access Rules" subtitle="Who can do what">
      <div className="p-4">
        <div className="mb-2 grid grid-cols-[76px_repeat(4,1fr)] gap-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          <div></div>
          {OPERATIONS.map((op) => (
            <div key={op} className="text-center" title={op}>
              {op.slice(0, 3)}
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          {ROLES.map((role) => {
            const scopedDisabled = role === "owner" && scopeUnresolved;
            const flagged = roleRisks(risks, role).length > 0;
            return (
              <div
                key={role}
                className="grid grid-cols-[76px_repeat(4,1fr)] items-center gap-1.5"
              >
                <div className="flex min-w-0 items-center gap-1">
                  <span className="truncate font-mono text-xs text-zinc-300">
                    {roleLabel(role)}
                  </span>
                  {flagged ? (
                    <AlertTriangle
                      className="h-3 w-3 shrink-0 text-amber-400"
                      aria-label={`${roleLabel(role)} has an unscoped write`}
                    />
                  ) : (
                    <Info
                      className="h-2.5 w-2.5 shrink-0 text-zinc-700"
                      aria-hidden="true"
                    />
                  )}
                </div>
                {OPERATIONS.map((op) => (
                  <ToggleCell
                    key={op}
                    label={OP_LABELS[op]}
                    on={rules[role][op]}
                    risky={rules[role][op] && isRisky(risks, role, op)}
                    disabled={scopedDisabled}
                    title={`${roleLabel(role)} ${op.toUpperCase()}`}
                    onClick={() => !scopedDisabled && toggle(role, op)}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {risks.length > 0 && (
          <ul className="mt-3 space-y-1.5" aria-live="polite">
            {risks.map((risk) => (
              <li
                key={`${risk.role}-${risk.op}`}
                className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 p-2 text-[11px] leading-relaxed text-amber-300/90"
              >
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{risk.message}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 space-y-2 rounded-md border border-[#1f1f23] bg-[#0a0a0b] p-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Row scope
            </span>
            <div className="flex items-center gap-1">
              <ScopeButton
                active={tenancy.mode === "owner"}
                onClick={() => onTenancyModeChange("owner")}
              >
                owner
              </ScopeButton>
              <ScopeButton
                active={tenancy.mode === "org"}
                onClick={() => onTenancyModeChange("org")}
              >
                org
              </ScopeButton>
            </div>
          </div>

          {predicate ? (
            <p className="break-words font-mono text-[11px] leading-relaxed text-[#3ECF8E]">
              {predicate}
            </p>
          ) : (
            <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-300/90">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              <span>
                Add one of{" "}
                {missingColumnCandidates(tenancy).map((name, i, all) => (
                  <span key={name}>
                    <code className="font-mono text-amber-200">{name}</code>
                    {i < all.length - 1 ? ", " : ""}
                  </span>
                ))}{" "}
                to scope the {scopedLabel} role.
              </span>
            </p>
          )}
        </div>
      </div>
    </Panel>
  );
}

function ScopeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded border px-2 py-0.5 font-mono text-[10px] transition",
        active
          ? "border-[#3ECF8E]/40 bg-[#3ECF8E]/10 text-[#3ECF8E]"
          : "border-[#1f1f23] text-zinc-500 hover:border-[#2a2a2e] hover:text-zinc-300"
      )}
    >
      {children}
    </button>
  );
}

function ToggleCell({
  label,
  on,
  risky,
  disabled,
  title,
  onClick,
}: {
  label: string;
  on: boolean;
  risky: boolean;
  disabled: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={on}
      className={cn(
        "flex h-9 items-center justify-center rounded-md border font-mono text-xs font-semibold transition",
        on && !risky && "border-[#3ECF8E]/40 bg-[#3ECF8E]/10 text-[#3ECF8E]",
        on && risky && "border-amber-500/50 bg-amber-500/10 text-amber-300",
        !on &&
          "border-[#1f1f23] bg-[#0a0a0b] text-zinc-700 hover:border-[#2a2a2e] hover:text-zinc-500",
        disabled &&
          "cursor-not-allowed opacity-30 hover:border-[#1f1f23] hover:text-zinc-700"
      )}
    >
      {label}
    </button>
  );
}
