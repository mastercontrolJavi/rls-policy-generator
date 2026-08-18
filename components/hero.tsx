"use client";

import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "rls-generator:howto-dismissed";

const STEPS = [
  {
    title: "Define your table",
    body: "Name the table and add the columns you actually store.",
  },
  {
    title: "Set who can do what",
    body: "Toggle SELECT, INSERT, UPDATE and DELETE for anon, auth and owner.",
  },
  {
    title: "Copy the generated SQL",
    body: "Read the preview, then paste it into the Supabase SQL editor.",
  },
];

export function Hero() {
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // Storage can be unavailable in private mode. Fall back to showing the strip.
    }
    setHydrated(true);
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Dismissal simply will not persist across reloads.
    }
  };

  return (
    <section className="mb-4">
      <p className="max-w-3xl text-[13px] leading-relaxed text-zinc-400 sm:text-sm">
        RLS policies are easy to misconfigure and hard to audit visually.{" "}
        <span className="text-zinc-200">
          This makes both visible before you ship.
        </span>
      </p>

      {hydrated && !dismissed && (
        <div className="mt-3 overflow-hidden rounded-lg border border-[#1f1f23] bg-[#111114]">
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="howto-steps"
              className="group flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform",
                  expanded && "rotate-180"
                )}
              />
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 transition group-hover:text-zinc-200">
                How to use
              </span>
              <span className="truncate text-[11px] text-zinc-600">
                3 steps
              </span>
            </button>
            <button
              onClick={dismiss}
              aria-label="Dismiss how to use"
              title="Dismiss"
              className="shrink-0 rounded p-1 text-zinc-600 transition hover:bg-[#0a0a0b] hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {expanded && (
            <ol
              id="howto-steps"
              className="grid gap-2 border-t border-[#1f1f23] p-3 sm:grid-cols-3"
            >
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="flex gap-2.5 rounded-md border border-[#1f1f23] bg-[#0a0a0b] p-2.5"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#3ECF8E]/10 font-mono text-[10px] text-[#3ECF8E] ring-1 ring-[#3ECF8E]/20">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11.5px] font-medium text-zinc-200">
                      {step.title}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}
