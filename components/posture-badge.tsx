"use client";

import { assessPosture } from "@/lib/posture";
import type { AppState } from "@/lib/types";
import { cn } from "@/lib/utils";

const TONE = {
  ok: {
    dot: "bg-[#3ECF8E] shadow-[0_0_8px_1px_rgba(62,207,142,0.7)]",
    text: "text-[#3ECF8E]/90",
    ring: "border-[#3ECF8E]/25",
  },
  warn: {
    dot: "bg-amber-400 shadow-[0_0_8px_1px_rgba(251,191,36,0.7)]",
    text: "text-amber-300/90",
    ring: "border-amber-500/30",
  },
  error: {
    dot: "bg-red-400 shadow-[0_0_8px_1px_rgba(248,113,113,0.7)]",
    text: "text-red-300/90",
    ring: "border-red-500/30",
  },
  empty: {
    dot: "bg-zinc-600",
    text: "text-zinc-500",
    ring: "border-[#1f1f23]",
  },
} as const;

export function PostureBadge({ state }: { state: AppState }) {
  const posture = assessPosture(state);
  const tone = TONE[posture.level];

  return (
    <div
      role="status"
      aria-live="polite"
      title={`Current configuration: ${posture.label}`}
      className={cn(
        "sunken hidden items-center gap-2 rounded-md border px-2.5 py-2 sm:flex",
        tone.ring
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tone.dot)}
      />
      <span className={cn("font-mono text-[10.5px] tracking-tight", tone.text)}>
        {posture.label}
      </span>
    </div>
  );
}
