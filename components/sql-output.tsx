"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { tokenize } from "@/lib/syntax-highlighter";
import { cn } from "@/lib/utils";
import { Panel } from "./ui/panel";

interface Props {
  sql: string;
  tableName: string;
}

export function SqlOutput({ sql, tableName }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed", err);
    }
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

  return (
    <Panel
      title="SQL Output"
      subtitle="Live preview"
      action={
        <div className="flex items-center gap-1">
          <IconButton
            onClick={handleCopy}
            label={copied ? "Copied" : "Copy SQL"}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-[#3ECF8E]" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </IconButton>
          <IconButton onClick={handleDownload} label="Download .sql">
            <Download className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      }
    >
      <div className="scrollbar-thin max-h-[calc(100vh-9rem)] overflow-auto bg-[#0a0a0b] p-4">
        <HighlightedSql sql={sql} />
      </div>
    </Panel>
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
