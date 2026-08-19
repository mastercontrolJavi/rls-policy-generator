"use client";

import { AlertTriangle, Info } from "lucide-react";
import type { AccessCheck } from "@/lib/access";
import { missingColumnCandidates, predicateSummary, scopedRoleLabel } from "@/lib/access";
import { MEMBER_HELP, OP_HELP, PANEL_HELP, ROLE_HELP, SCOPE_HELP } from "@/lib/help";
import { detectRisks, isRisky, roleRisks } from "@/lib/risks";
import type { AccessRules as AccessRulesType, Operation, Role, Tenancy } from "@/lib/types";
import { OPERATIONS, ROLES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { InfoPopover } from "./ui/info-popover";
import { Panel } from "./ui/panel";

interface Props {
  rules: AccessRulesType;
  check: AccessCheck;
  tenancy: Tenancy;
  onChange: (rules: AccessRulesType) => void;
  onTenancyModeChange: (mode: Tenancy["mode"]) => void;
}

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
    <Panel title="Access Rules" subtitle="Who can do what" help={PANEL_HELP.access}>
      <div className="p-4">
        <div className="mb-2 grid grid-cols-[76px_repeat(4,1fr)] gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-600">
          <div></div>
          {OPERATIONS.map((op) => (
            <div key={op} className="flex items-center justify-center gap-0.5">
              <InfoPopover
                explainer={OP_HELP[op]}
                label={`What does ${op.toUpperCase()} do?`}
                className="text-zinc-600 hover:text-[#3ECF8E]"
              >
                <span className="underline decoration-dotted decoration-from-font underline-offset-2">
                  {op.slice(0, 3)}
                </span>
              </InfoPopover>
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
                  <InfoPopover
                    explainer={
                      role === "owner" && tenancy.mode === "org"
                        ? MEMBER_HELP
                        : ROLE_HELP[role]
                    }
                    label={`What is the ${roleLabel(role)} role?`}
                    className="min-w-0 text-zinc-300 hover:text-[#3ECF8E]"
                  >
                    <span className="truncate font-mono text-xs underline decoration-dotted decoration-from-font underline-offset-2">
                      {roleLabel(role)}
                    </span>
                  </InfoPopover>
                  {flagged && (
                    <AlertTriangle
                      className="h-3 w-3 shrink-0 text-amber-400"
                      aria-label={`${roleLabel(role)} has an unscoped write`}
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
                className="reveal flex items-start gap-2 rounded-lg border border-amber-500/25 bg-amber-500/[0.07] p-2 text-[11px] leading-relaxed text-amber-300/90"
              >
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{risk.message}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="sunken mt-3 space-y-2 rounded-lg border border-[#1f1f23] p-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-600">
                Row scope
              </span>
              <InfoPopover explainer={SCOPE_HELP} />
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
        "relative flex h-9 items-center justify-center rounded-md border font-mono text-xs font-semibold",
        "transition-all duration-200 ease-out active:scale-[0.94]",
        on &&
          !risky &&
          "lit-accent border-transparent bg-[#3ECF8E]/[0.14] text-[#3ECF8E]",
        on &&
          risky &&
          "lit-amber border-transparent bg-amber-500/[0.14] text-amber-300",
        !on &&
          "sunken border-[#1f1f23] text-zinc-700 hover:border-[#2c2c34] hover:text-zinc-500",
        disabled &&
          "cursor-not-allowed opacity-25 active:scale-100 hover:border-[#1f1f23] hover:text-zinc-700"
      )}
    >
      {on && !disabled && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-0 rounded-md opacity-60 blur-[6px]",
            risky ? "bg-amber-500/25" : "bg-[#3ECF8E]/25"
          )}
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}
