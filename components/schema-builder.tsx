"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Column, ColumnType, Schema } from "@/lib/types";
import { COLUMN_TYPES } from "@/lib/types";
import { uid } from "@/lib/utils";
import { Panel } from "./ui/panel";

interface Props {
  schema: Schema;
  onChange: (schema: Schema) => void;
}

export function SchemaBuilder({ schema, onChange }: Props) {
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

  return (
    <Panel title="Schema" subtitle="Table structure">
      <div className="space-y-4 p-4">
        <div>
          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            Table name
          </label>
          <input
            value={schema.tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="posts"
            className="w-full rounded-md border border-[#1f1f23] bg-[#0a0a0b] px-3 py-2 font-mono text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-[#3ECF8E]/50"
          />
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
                onUpdate={(patch) => updateColumn(col.id, patch)}
                onRemove={() => removeColumn(col.id)}
              />
            ))}
            {schema.columns.length === 0 && (
              <div className="rounded-md border border-dashed border-[#1f1f23] py-6 text-center text-xs text-zinc-600">
                No columns yet
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

function ColumnRow({
  column,
  onUpdate,
  onRemove,
}: {
  column: Column;
  onUpdate: (patch: Partial<Column>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="group flex items-center gap-1.5 rounded-md border border-[#1f1f23] bg-[#0a0a0b] px-2 py-1.5 transition focus-within:border-[#3ECF8E]/30">
      <input
        value={column.name}
        onChange={(e) => onUpdate({ name: e.target.value })}
        placeholder="column_name"
        className="min-w-0 flex-1 bg-transparent px-1 font-mono text-xs text-zinc-100 outline-none placeholder:text-zinc-600"
      />
      <select
        value={column.type}
        onChange={(e) => onUpdate({ type: e.target.value as ColumnType })}
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
        aria-label="Remove column"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
