"use client";

import { ChevronDown } from "lucide-react";
import { presetLabels } from "@/lib/presets";

export function PresetSelector({
  onSelect,
}: {
  onSelect: (key: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value=""
        onChange={(e) => {
          if (e.target.value) onSelect(e.target.value);
        }}
        className="cursor-pointer appearance-none rounded-md border border-[#1f1f23] bg-[#111114] px-3 py-2 pr-8 text-xs text-zinc-200 transition hover:border-[#2a2a2e] focus:border-[#3ECF8E]/50 focus:outline-none"
      >
        <option value="" disabled>
          Load preset…
        </option>
        {Object.entries(presetLabels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
    </div>
  );
}
