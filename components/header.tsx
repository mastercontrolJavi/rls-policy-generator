"use client";

import { Database } from "lucide-react";
import type { AppState } from "@/lib/types";
import { PresetSelector } from "./preset-selector";
import { ShareButton } from "./share-button";

interface HeaderProps {
  state: AppState;
  onPresetChange: (key: string) => void;
}

export function Header({ state, onPresetChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#1f1f23] bg-[#0a0a0b]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#3ECF8E]/25 bg-[#3ECF8E]/[0.08]">
            <Database className="h-4 w-4 text-[#3ECF8E]" />
            <span
              aria-hidden="true"
              className="flare absolute -inset-1 -z-10 rounded-lg bg-[#3ECF8E]/20 blur-md"
            />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-mono text-[13px] font-medium tracking-tight text-zinc-100">
              rls<span className="text-[#3ECF8E]">.</span>policy
              <span className="hidden sm:inline">
                <span className="text-zinc-600">/</span>generator
              </span>
            </h1>
            <p className="hidden truncate text-[10.5px] tracking-wide text-zinc-600 sm:block">
              Visual builder for Supabase Row Level Security
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ShareButton state={state} />
          <PresetSelector onSelect={onPresetChange} />
        </div>
      </div>

      {/* Light spilling off the bottom edge of the bar. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-[#3ECF8E]/25 to-transparent"
      />
    </header>
  );
}
