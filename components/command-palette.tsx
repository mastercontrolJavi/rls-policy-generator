"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { presetLabels, presets } from "@/lib/presets";
import type { AppState, Operation, Role } from "@/lib/types";
import { OPERATIONS, ROLES } from "@/lib/types";
import { encodeState } from "@/lib/url-state";
import { cn, uid } from "@/lib/utils";

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords: string;
  run: () => void;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: AppState;
  sql: string;
  /** True when SqlOutput is withholding generation, so exports stay hidden here too. */
  blocked: boolean;
  onState: (next: AppState) => void;
}

const ROLE_LABELS: Record<Role, string> = {
  anon: "anon",
  authenticated: "auth",
  owner: "owner",
};

export function CommandPalette({
  open,
  onOpenChange,
  state,
  sql,
  blocked,
  onState,
}: Props) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const commands = useMemo<Command[]>(() => {
    const out: Command[] = [];

    for (const [key, label] of Object.entries(presetLabels)) {
      out.push({
        id: `preset:${key}`,
        group: "Presets",
        label,
        hint: presets[key].schema.tableName,
        keywords: `preset template ${key} ${label}`,
        run: () =>
          onState({
            schema: {
              tableName: presets[key].schema.tableName,
              columns: presets[key].schema.columns.map((c) => ({ ...c })),
            },
            rules: {
              anon: { ...presets[key].rules.anon },
              authenticated: { ...presets[key].rules.authenticated },
              owner: { ...presets[key].rules.owner },
            },
            tenancy: { ...presets[key].tenancy },
          }),
      });
    }

    for (const role of ROLES) {
      for (const op of OPERATIONS) {
        const on = state.rules[role][op];
        out.push({
          id: `toggle:${role}:${op}`,
          group: "Access",
          label: `${on ? "Disable" : "Enable"} ${ROLE_LABELS[role]} ${op.toUpperCase()}`,
          hint: on ? "on" : "off",
          keywords: `toggle ${role} ${op} access rule policy`,
          run: () =>
            onState({
              ...state,
              rules: {
                ...state.rules,
                [role]: { ...state.rules[role], [op]: !on },
              },
            }),
        });
      }
    }

    for (const mode of ["owner", "org"] as const) {
      out.push({
        id: `scope:${mode}`,
        group: "Row scope",
        label: mode === "owner" ? "Scope rows by owner column" : "Scope rows by org membership",
        hint: state.tenancy.mode === mode ? "active" : undefined,
        keywords:
          mode === "org"
            ? "scope tenancy org multi tenant membership join organisation"
            : "scope tenancy owner user auth uid column",
        run: () => onState({ ...state, tenancy: { ...state.tenancy, mode } }),
      });
    }

    // Exporting SQL the panel refuses to hand over would defeat the point of
    // withholding it, so these two disappear under the same condition.
    if (!blocked) {
      out.push(
        {
          id: "action:copy-sql",
          group: "Actions",
          label: "Copy SQL",
          keywords: "copy sql clipboard output",
          run: () => void navigator.clipboard.writeText(sql).catch(() => {}),
        },
        {
          id: "action:download",
          group: "Actions",
          label: "Download .sql",
          keywords: "download save file sql",
          run: () => {
            const blob = new Blob([sql], { type: "text/sql" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${state.schema.tableName || "policies"}.sql`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          },
        }
      );
    }

    out.push(
      {
        id: "action:copy-link",
        group: "Actions",
        label: "Copy share link",
        keywords: "copy share link url",
        run: () => {
          const { origin, pathname } = window.location;
          void navigator.clipboard
            .writeText(`${origin}${pathname}?${encodeState(state)}`)
            .catch(() => {});
        },
      },
      {
        id: "action:add-column",
        group: "Actions",
        label: "Add column",
        keywords: "add new column schema field",
        run: () =>
          onState({
            ...state,
            schema: {
              ...state.schema,
              columns: [
                ...state.schema.columns,
                {
                  id: uid(),
                  name: `col_${state.schema.columns.length + 1}`,
                  type: "text",
                },
              ],
            },
          }),
      },
      {
        id: "action:clear",
        group: "Actions",
        label: "Clear table",
        hint: "start empty",
        keywords: "clear reset empty new blank",
        run: () =>
          onState({
            ...state,
            schema: { tableName: "", columns: [] },
          }),
      }
    );

    return out;
  }, [state, sql, blocked, onState]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    const terms = q.split(/\s+/);
    return commands.filter((c) => {
      const haystack = `${c.label} ${c.group} ${c.keywords}`.toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }, [commands, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (open) {
      restoreFocus.current = document.activeElement as HTMLElement | null;
      setQuery("");
      setActive(0);
      // Wait for the dialog to mount before moving focus into it.
      const id = window.requestAnimationFrame(() => inputRef.current?.focus());
      return () => window.cancelAnimationFrame(id);
    }
    restoreFocus.current?.focus?.();
  }, [open]);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open, results.length]);

  if (!open) return null;

  const runActive = () => {
    const command = results[active];
    if (!command) return;
    command.run();
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) =>
        results.length ? (i - 1 + results.length) % results.length : 0
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      runActive();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  let lastGroup = "";

  return (
    <div
      className="overlay-in fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="dialog-in panel-surface w-full max-w-lg overflow-hidden rounded-xl border border-[#2c2c34]"
      >
        <div className="flex items-center gap-2.5 border-b border-[#1f1f23] px-3.5 py-3">
          <Search className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search presets, toggles and actions"
            aria-label="Search commands"
            className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          <kbd className="shrink-0 rounded border border-[#2c2c34] px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-600">
            esc
          </kbd>
        </div>

        <div
          ref={listRef}
          className="scrollbar-thin max-h-[52vh] overflow-y-auto p-1.5"
        >
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-[12px] text-zinc-600">
              Nothing matches {`"${query}"`}
            </p>
          )}

          {results.map((command, i) => {
            const newGroup = command.group !== lastGroup;
            lastGroup = command.group;
            return (
              <div key={command.id}>
                {newGroup && (
                  <div className="px-2.5 pb-1 pt-2.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-zinc-600">
                    {command.group}
                  </div>
                )}
                <button
                  data-active={i === active}
                  onMouseMove={() => setActive(i)}
                  onClick={runActive}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors",
                    i === active
                      ? "bg-[#3ECF8E]/[0.12] text-[#3ECF8E]"
                      : "text-zinc-300 hover:bg-white/[0.03]"
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-[12.5px]">
                    {command.label}
                  </span>
                  {command.hint && (
                    <span className="shrink-0 font-mono text-[10px] text-zinc-600">
                      {command.hint}
                    </span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-3 border-t border-[#1f1f23] px-3.5 py-2 font-mono text-[9.5px] text-zinc-600">
          <span>↑↓ navigate</span>
          <span>↵ run</span>
          <span className="ml-auto">
            {results.length} {results.length === 1 ? "result" : "results"}
          </span>
        </div>
      </div>
    </div>
  );
}
