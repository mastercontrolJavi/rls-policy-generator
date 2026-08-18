"use client";

import { useState } from "react";
import { AlertTriangle, Check, Copy, Download, FileCode2, X } from "lucide-react";
import { tokenize } from "@/lib/syntax-highlighter";
import type { Issue } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { EmptyState } from "./ui/empty-state";
import { Panel } from "./ui/panel";

interface Props {
  sql: string;
  tableName: string;
  empty: boolean;
  errors: Issue[];
}

type CopyStatus = "idle" | "copied" | "failed";

export function SqlOutput({ sql, tableName, empty, errors }: Props) {
  const [copied, setCopied] = useState<CopyStatus>("idle");
  const blocked = empty || errors.length > 0;
  const lineCount = sql.split("\n").length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied("copied");
    } catch {
      // Clipboard access needs a secure context and can be denied.
      setCopied("failed");
    }
    window.setTimeout(() => setCopied("idle"), 1800);
  };

  const handleDownload = () => {
    const blob = new Blob([sql], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tableName || "policies"}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const subtitle = empty
    ? "Nothing to generate"
    : errors.length > 0
      ? `${errors.length} ${errors.length === 1 ? "error" : "errors"}`
      : "Live preview";

  return (
    <Panel
      title="SQL Output"
      subtitle={subtitle}
      primary={!blocked}
      action={
        blocked ? null : (
          <div className="flex items-center gap-1">
            <IconButton
              onClick={handleCopy}
              label={
                copied === "copied"
                  ? "Copied"
                  : copied === "failed"
                    ? "Copy failed"
                    : "Copy SQL"
              }
            >
              {copied === "copied" ? (
                <Check className="h-3.5 w-3.5 text-[#3ECF8E]" />
              ) : copied === "failed" ? (
                <X className="h-3.5 w-3.5 text-red-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </IconButton>
            <IconButton onClick={handleDownload} label="Download .sql">
              <Download className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        )
      }
    >
      {empty ? (
        <EmptyState
          icon={<FileCode2 className="h-4 w-4" />}
          title="No SQL yet"
          body="Define a table on the left and the policies will appear here as you toggle access."
        />
      ) : errors.length > 0 ? (
        <SqlErrors errors={errors} />
      ) : (
        <div className="relative">
          <div className="flex items-center gap-2 border-b border-[#1f1f23] bg-[#0c0c0f] px-4 py-1.5">
            <span className="flex gap-1" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-[#2c2c34]" />
              <span className="h-2 w-2 rounded-full bg-[#2c2c34]" />
              <span className="h-2 w-2 rounded-full bg-[#2c2c34]" />
            </span>
            <span className="truncate font-mono text-[10px] text-zinc-600">
              {(tableName || "policies").trim()}_policies.sql
            </span>
            <span className="ml-auto font-mono text-[10px] text-zinc-700">
              {lineCount} {lineCount === 1 ? "line" : "lines"}
            </span>
          </div>
          <div className="scrollbar-thin max-h-[calc(100vh-11.5rem)] overflow-auto bg-[#070709] p-4">
            <HighlightedSql sql={sql} />
          </div>
          {/* Light pooling at the top of the well. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-7 h-16 bg-gradient-to-b from-[#3ECF8E]/[0.045] to-transparent"
          />
        </div>
      )}
    </Panel>
  );
}

/**
 * Generation is withheld rather than emitting SQL that fails on paste. The
 * whole point of the tool is catching this before it ships.
 */
function SqlErrors({ errors }: { errors: Issue[] }) {
  return (
    <div className="bg-[#070709] p-4">
      <div className="reveal flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/[0.07] p-3">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-red-200">
            Fix the schema to generate SQL
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
            These names would not survive a paste into the SQL editor, so
            nothing is generated yet.
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {errors.map((error, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-[11px] leading-relaxed text-red-300/90"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-red-400/70" />
                <span>{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function HighlightedSql({ sql }: { sql: string }) {
  const tokens = tokenize(sql);
  return (
    <pre className="whitespace-pre font-mono text-[12.5px] leading-6 text-zinc-300">
      <code>
        {tokens.map((t, i) => {
          const cls = tokenClass(t.type);
          return cls ? (
            <span key={i} className={cls}>
              {t.value}
            </span>
          ) : (
            <span key={i}>{t.value}</span>
          );
        })}
      </code>
    </pre>
  );
}

function tokenClass(type: string): string | null {
  switch (type) {
    case "keyword":
      return "text-[#3ECF8E] font-semibold";
    case "string":
      return "text-amber-400";
    case "comment":
      return "text-zinc-600 italic";
    case "punct":
      return "text-zinc-500";
    default:
      return null;
  }
}

function IconButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-zinc-400 transition",
        "hover:border-[#1f1f23] hover:bg-[#0a0a0b] hover:text-zinc-200"
      )}
    >
      {children}
    </button>
  );
}
