"use client";

import { Database } from "lucide-react";
import { PresetSelector } from "./preset-selector";

interface HeaderProps {
  onPresetChange: (key: string) => void;
}

export function Header({ onPresetChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#1f1f23] bg-[#0a0a0b]/85 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#3ECF8E]/10 ring-1 ring-[#3ECF8E]/20">
            <Database className="h-4 w-4 text-[#3ECF8E]" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-tight text-zinc-100">
              RLS Policy Generator
            </h1>
            <p className="truncate text-[11px] text-zinc-500">
              Visual builder for Supabase Row Level Security
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PresetSelector onSelect={onPresetChange} />
        </div>
      </div>
    </header>
  );
}
