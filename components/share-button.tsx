"use client";

import { useState } from "react";
import { Check, Link2, X } from "lucide-react";
import type { AppState } from "@/lib/types";
import { encodeState } from "@/lib/url-state";
import { cn } from "@/lib/utils";

type Status = "idle" | "copied" | "failed";

export function ShareButton({ state }: { state: AppState }) {
  const [status, setStatus] = useState<Status>("idle");

  const handleCopy = async () => {
    // Built from state rather than location.href so the link is current even
    // if the debounced URL write has not landed yet.
    const { origin, pathname } = window.location;
    const url = `${origin}${pathname}?${encodeState(state)}`;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      // Clipboard access needs a secure context and can be denied.
      setStatus("failed");
    }
    window.setTimeout(() => setStatus("idle"), 1800);
  };

  const label =
    status === "copied"
      ? "Link copied"
      : status === "failed"
        ? "Copy failed"
        : "Copy share link";

  return (
    <button
      onClick={handleCopy}
      title={label}
      aria-label={label}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2.5 py-2 text-xs transition",
        status === "failed"
          ? "border-red-500/40 text-red-300"
          : status === "copied"
            ? "border-[#3ECF8E]/40 text-[#3ECF8E]"
            : "border-[#1f1f23] bg-[#111114] text-zinc-400 hover:border-[#2a2a2e] hover:text-zinc-200"
      )}
    >
      {status === "copied" ? (
        <Check className="h-3.5 w-3.5" />
      ) : status === "failed" ? (
        <X className="h-3.5 w-3.5" />
      ) : (
        <Link2 className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">
        {status === "idle" ? "Share" : status === "copied" ? "Copied" : "Failed"}
      </span>
    </button>
  );
}
