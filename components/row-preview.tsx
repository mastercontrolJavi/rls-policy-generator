"use client";

import { Eye, Pencil } from "lucide-react";
import type { AccessRules, Schema } from "@/lib/types";
import { generateSampleRows, SIM_USER_DISPLAY } from "@/lib/sample-data";
import { cn } from "@/lib/utils";
import { Panel } from "./ui/panel";

interface Props {
  schema: Schema;
  rules: AccessRules;
  ownerColumn: string | null;
}

export function RowPreview({ schema, rules, ownerColumn }: Props) {
  if (schema.columns.length === 0) {
    return (
      <Panel title="Row Preview" subtitle="Visual access map">
        <div className="p-4 text-xs text-zinc-600">
          Add columns to see sample rows.
        </div>
      </Panel>
    );
  }

  const rows = generateSampleRows(schema.columns);
  const visibleCols = schema.columns.slice(0, 3);

  return (
    <Panel title="Row Preview" subtitle="Visual access map">
      <div className="p-4">
        <div className="mb-3 text-[11px] text-zinc-500">
          Simulating{" "}
          <span className="font-mono text-[#3ECF8E]">
            auth.uid() = {SIM_USER_DISPLAY}
          </span>
        </div>

        <div className="space-y-2">
          {rows.map((row, idx) => (
            <RowCard
              key={idx}
              cells={row.cells}
              visibleCols={visibleCols}
              isOwned={row.isOwned}
              rules={rules}
              ownerColumn={ownerColumn}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-end gap-3 text-[10px] text-zinc-600">
          <LegendDot label="visible" icon={<Eye className="h-2.5 w-2.5" />} />
          <LegendDot label="editable" icon={<Pencil className="h-2.5 w-2.5" />} />
        </div>
      </div>
    </Panel>
  );
}

interface RowCardProps {
  cells: Record<string, string>;
  visibleCols: { name: string }[];
  isOwned: boolean;
  rules: AccessRules;
  ownerColumn: string | null;
}

function RowCard({ cells, visibleCols, isOwned, rules, ownerColumn }: RowCardProps) {
  const anonRead = rules.anon.select;
  const authRead = rules.authenticated.select;
  const ownerRead = ownerColumn ? rules.owner.select && isOwned : false;

  const anonWrite =
    rules.anon.insert || rules.anon.update || rules.anon.delete;
  const authWrite =
    rules.authenticated.insert ||
    rules.authenticated.update ||
    rules.authenticated.delete;
  const ownerWrite = ownerColumn
    ? (rules.owner.insert || rules.owner.update || rules.owner.delete) &&
      isOwned
    : false;

  return (
    <div
      className={cn(
        "rounded-md border bg-[#0a0a0b] p-2.5 transition",
        isOwned ? "border-[#3ECF8E]/25" : "border-[#1f1f23]"
      )}
    >
      <div className="space-y-0.5 font-mono text-[11px]">
        {visibleCols.map((col) => (
          <div key={col.name} className="flex items-center gap-2">
            <span className="w-14 shrink-0 truncate text-zinc-600">
              {col.name}
            </span>
            <span className="truncate text-zinc-300">{cells[col.name]}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-[#1f1f23] pt-2">
        <RoleBadge
          label="anon"
          canRead={anonRead}
          canWrite={anonWrite}
          tone="zinc"
        />
        <RoleBadge
          label="auth"
          canRead={authRead}
          canWrite={authWrite}
          tone="blue"
        />
        <RoleBadge
          label="owner"
          canRead={ownerRead}
          canWrite={ownerWrite}
          tone="green"
        />
        {isOwned && (
          <span className="ml-auto rounded bg-[#3ECF8E]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#3ECF8E]">
            owned
          </span>
        )}
      </div>
    </div>
  );
}

function RoleBadge({
  label,
  canRead,
  canWrite,
  tone,
}: {
  label: string;
  canRead: boolean;
  canWrite: boolean;
  tone: "zinc" | "blue" | "green";
}) {
  const dim = !canRead && !canWrite;
  const ringClass = {
    zinc: "ring-zinc-500/30",
    blue: "ring-blue-400/30",
    green: "ring-[#3ECF8E]/40",
  }[tone];
  const labelColor = {
    zinc: "text-zinc-300",
    blue: "text-blue-300",
    green: "text-[#3ECF8E]",
  }[tone];

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9.5px] ring-1 transition",
        dim
          ? "text-zinc-700 ring-[#1f1f23]"
          : `${labelColor} ${ringClass}`
      )}
    >
      <span>{label}</span>
      <Eye
        className={cn(
          "h-2.5 w-2.5",
          canRead ? "opacity-100" : "opacity-20"
        )}
      />
      <Pencil
        className={cn(
          "h-2.5 w-2.5",
          canWrite ? "opacity-100" : "opacity-20"
        )}
      />
    </div>
  );
}

function LegendDot({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-zinc-400">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
