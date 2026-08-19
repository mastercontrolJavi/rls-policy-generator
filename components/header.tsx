"use client";

import { BookOpen, Database, Search } from "lucide-react";
import type { AppState } from "@/lib/types";
import { PostureBadge } from "./posture-badge";
import { PresetSelector } from "./preset-selector";
import { ShareButton } from "./share-button";

interface HeaderProps {
  state: AppState;
  onPresetChange: (key: string) => void;
  onOpenPalette: () => void;
  onOpenGuide: () => void;
}

export function Header({
  state,
  onPresetChange,
  onOpenPalette,
  onOpenGuide,
}: HeaderProps) {
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
          <PostureBadge state={state} />
          <button
            onClick={onOpenGuide}
            aria-label="Open the guide to Row Level Security"
            title="Guide (press ?)"
            className="flex items-center gap-1.5 rounded-md border border-[#1f1f23] bg-[#111114] px-2.5 py-2 text-xs text-zinc-400 transition hover:border-[#3ECF8E]/35 hover:text-[#3ECF8E]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Guide</span>
          </button>
          <button
            onClick={onOpenPalette}
            aria-label="Open command palette"
            title="Command palette"
            className="hidden items-center gap-2 rounded-md border border-[#1f1f23] bg-[#111114] px-2.5 py-2 text-zinc-500 transition hover:border-[#2c2c34] hover:text-zinc-300 sm:flex"
          >
            <Search className="h-3.5 w-3.5" />
            <kbd className="font-mono text-[10px] tracking-tight">⌘K</kbd>
          </button>
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
