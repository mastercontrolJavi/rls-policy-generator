"use client";

import { Info } from "lucide-react";
import type { AccessRules as AccessRulesType, Operation, Role } from "@/lib/types";
import { OPERATIONS, ROLES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Panel } from "./ui/panel";

interface Props {
  rules: AccessRulesType;
  ownerColumn: string | null;
  onChange: (rules: AccessRulesType) => void;
}

const ROLE_LABELS: Record<Role, string> = {
  anon: "anon",
  authenticated: "auth",
  owner: "owner",
};

const ROLE_HINTS: Record<Role, string> = {
  anon: "Public, unauthenticated visitors",
  authenticated: "Any signed-in user",
  owner: "Row's user_id matches auth.uid()",
};

const OP_LABELS: Record<Operation, string> = {
  select: "S",
  insert: "I",
  update: "U",
  delete: "D",
};

export function AccessRules({ rules, ownerColumn, onChange }: Props) {
  const toggle = (role: Role, op: Operation) => {
    onChange({
      ...rules,
      [role]: { ...rules[role], [op]: !rules[role][op] },
    });
  };

  return (
    <Panel title="Access Rules" subtitle="Who can do what">
      <div className="p-4">
        <div className="mb-2 grid grid-cols-[64px_repeat(4,1fr)] gap-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          <div></div>
          {OPERATIONS.map((op) => (
            <div key={op} className="text-center" title={op}>
              {op.slice(0, 3)}
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          {ROLES.map((role) => {
            const isOwnerDisabled = role === "owner" && !ownerColumn;
            return (
              <div
                key={role}
                className="grid grid-cols-[64px_repeat(4,1fr)] items-center gap-1.5"
              >
                <div className="flex items-center gap-1" title={ROLE_HINTS[role]}>
                  <span className="font-mono text-xs text-zinc-300">
                    {ROLE_LABELS[role]}
                  </span>
                  <Info className="h-2.5 w-2.5 text-zinc-700" />
                </div>
                {OPERATIONS.map((op) => (
                  <ToggleCell
                    key={op}
                    label={OP_LABELS[op]}
                    on={rules[role][op]}
                    disabled={isOwnerDisabled}
                    onClick={() => !isOwnerDisabled && toggle(role, op)}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {!ownerColumn ? (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/5 p-2.5 text-[11px] leading-relaxed text-amber-300/90">
            <Info className="mt-0.5 h-3 w-3 shrink-0" />
            <span>
              Add a <code className="font-mono">user_id</code>,{" "}
              <code className="font-mono">owner_id</code>, or{" "}
              <code className="font-mono">created_by</code> column to enable
              owner policies.
            </span>
          </div>
        ) : (
          <div className="mt-3 rounded-md border border-[#1f1f23] bg-[#0a0a0b] p-2.5 font-mono text-[11px] text-zinc-500">
            owner check:{" "}
            <span className="text-[#3ECF8E]">
              auth.uid() = {ownerColumn}
            </span>
          </div>
        )}
      </div>
    </Panel>
  );
}

function ToggleCell({
  label,
  on,
  disabled,
  onClick,
}: {
  label: string;
  on: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-9 items-center justify-center rounded-md border font-mono text-xs font-semibold transition",
        on
          ? "border-[#3ECF8E]/40 bg-[#3ECF8E]/10 text-[#3ECF8E]"
          : "border-[#1f1f23] bg-[#0a0a0b] text-zinc-700 hover:border-[#2a2a2e] hover:text-zinc-500",
        disabled && "cursor-not-allowed opacity-30 hover:border-[#1f1f23] hover:text-zinc-700"
      )}
    >
      {label}
    </button>
  );
}
