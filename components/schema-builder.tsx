"use client";

import { AlertTriangle, Plus, Table2, Trash2 } from "lucide-react";
import type { Column, ColumnType, Schema } from "@/lib/types";
import { COLUMN_TYPES } from "@/lib/types";
import type { Issue } from "@/lib/validation";
import { isSchemaEmpty, issuesForColumn, issuesForTable, worstLevel } from "@/lib/validation";
import { cn, uid } from "@/lib/utils";
import { EmptyState } from "./ui/empty-state";
import { Panel } from "./ui/panel";

interface Props {
  schema: Schema;
  issues: Issue[];
  onChange: (schema: Schema) => void;
}

export function SchemaBuilder({ schema, issues, onChange }: Props) {
  const empty = isSchemaEmpty(schema);
  const tableIssues = issuesForTable(issues);
  const tableLevel = worstLevel(tableIssues);

  const setTableName = (tableName: string) =>
    onChange({ ...schema, tableName });

  const addColumn = () => {
    const newCol: Column = {
      id: uid(),
      name: `col_${schema.columns.length + 1}`,
      type: "text",
    };
    onChange({ ...schema, columns: [...schema.columns, newCol] });
  };

  const startFromScratch = () => {
    onChange({
      tableName: "my_table",
      columns: [
        { id: uid(), name: "id", type: "uuid" },
        { id: uid(), name: "user_id", type: "uuid" },
      ],
    });
  };

  const updateColumn = (id: string, patch: Partial<Column>) => {
    onChange({
      ...schema,
      columns: schema.columns.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    });
  };

  const removeColumn = (id: string) => {
    onChange({
      ...schema,
      columns: schema.columns.filter((c) => c.id !== id),
    });
  };

  if (empty) {
    return (
      <Panel title="Schema" subtitle="Table structure">
        <EmptyState
          icon={<Table2 className="h-4 w-4" />}
          title="No table yet"
          body="Name a table and add its columns, or load one of the presets from the top right to start from a working example."
          action={
            <button
              onClick={startFromScratch}
              className="flex items-center gap-2 rounded-md border border-[#1f1f23] bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-300 transition hover:border-[#3ECF8E]/30 hover:text-[#3ECF8E]"
            >
              <Plus className="h-3.5 w-3.5" />
              Start a table
            </button>
          }
        />
      </Panel>
    );
  }

  return (
    <Panel title="Schema" subtitle="Table structure">
      <div className="space-y-4 p-4">
        <div>
          <label
            htmlFor="table-name"
            className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500"
          >
            Table name
          </label>
          <input
            id="table-name"
            value={schema.tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="posts"
            aria-invalid={tableLevel === "error"}
            className={cn(
              "w-full rounded-md border bg-[#0a0a0b] px-3 py-2 font-mono text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600",
              tableLevel === "error"
                ? "border-red-500/50 focus:border-red-500/70"
                : tableLevel === "warning"
                  ? "border-amber-500/40 focus:border-amber-500/60"
                  : "border-[#1f1f23] focus:border-[#3ECF8E]/50"
            )}
          />
          <IssueList issues={tableIssues} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Columns
            </label>
            <span className="text-[10px] text-zinc-600">
              {schema.columns.length}{" "}
              {schema.columns.length === 1 ? "column" : "columns"}
            </span>
          </div>

          <div className="space-y-1.5">
            {schema.columns.map((col) => (
              <ColumnRow
                key={col.id}
                column={col}
                issues={issuesForColumn(issues, col.id)}
                onUpdate={(patch) => updateColumn(col.id, patch)}
                onRemove={() => removeColumn(col.id)}
              />
            ))}
            {schema.columns.length === 0 && (
              <div className="rounded-md border border-dashed border-[#1f1f23] px-3 py-5 text-center text-[11px] leading-relaxed text-zinc-600">
                No columns yet. Add at least one to generate a table.
              </div>
            )}
          </div>

          <button
            onClick={addColumn}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-[#1f1f23] bg-[#0a0a0b] px-3 py-2 text-xs text-zinc-400 transition hover:border-[#3ECF8E]/30 hover:text-[#3ECF8E]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add column
          </button>
        </div>
      </div>
    </Panel>
  );
}

function IssueList({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) return null;
  return (
    <ul className="mt-1.5 space-y-1">
      {issues.map((issue, i) => (
        <li
          key={i}
          className={cn(
            "flex items-start gap-1.5 text-[10.5px] leading-relaxed",
            issue.level === "error" ? "text-red-300/90" : "text-amber-300/90"
          )}
        >
          <AlertTriangle className="mt-0.5 h-2.5 w-2.5 shrink-0" />
          <span>{issue.message}</span>
        </li>
      ))}
    </ul>
  );
}

function ColumnRow({
  column,
  issues,
  onUpdate,
  onRemove,
}: {
  column: Column;
  issues: Issue[];
  onUpdate: (patch: Partial<Column>) => void;
  onRemove: () => void;
}) {
  const level = worstLevel(issues);

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 rounded-md border bg-[#0a0a0b] px-2 py-1.5 transition",
          level === "error"
            ? "border-red-500/50 focus-within:border-red-500/70"
            : level === "warning"
              ? "border-amber-500/40 focus-within:border-amber-500/60"
              : "border-[#1f1f23] focus-within:border-[#3ECF8E]/30"
        )}
      >
        <input
          value={column.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="column_name"
          aria-label="Column name"
          aria-invalid={level === "error"}
          className="min-w-0 flex-1 bg-transparent px-1 font-mono text-xs text-zinc-100 outline-none placeholder:text-zinc-600"
        />
        <select
          value={column.type}
          onChange={(e) => onUpdate({ type: e.target.value as ColumnType })}
          aria-label="Column type"
          className="shrink-0 cursor-pointer rounded border border-[#1f1f23] bg-[#111114] px-1.5 py-1 font-mono text-[11px] text-[#3ECF8E] outline-none focus:border-[#3ECF8E]/50"
        >
          {COLUMN_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          onClick={onRemove}
          className="shrink-0 rounded p-1 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
          aria-label={`Remove column ${column.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      <IssueList issues={issues} />
    </div>
  );
}
