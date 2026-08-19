"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "rls-generator:howto-dismissed";

const STEPS = [
  {
    title: "Define your table",
    body: "Name the table and list its columns. Include a user_id or org_id so rows can be tied to whoever owns them.",
  },
  {
    title: "Set who can do what",
    body: "Turn on the operations each role should have. Anything left off is denied, and anything risky turns amber as you go.",
  },
  {
    title: "Read what it permits",
    body: "Every policy gets a plain English sentence above it. Row Preview shows the same rules applied to real sample rows.",
  },
  {
    title: "Run it in Supabase",
    body: "Copy the SQL, open SQL Editor in your project, paste and run. Delete the CREATE TABLE block if the table already exists.",
  },
];

export function Hero({ onOpenGuide }: { onOpenGuide: () => void }) {
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
    <section className="reveal mb-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-px w-5 bg-gradient-to-r from-[#3ECF8E] to-transparent" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#3ECF8E]/80">
          Postgres row level security
        </span>
      </div>

      <h2 className="max-w-[46ch] text-balance text-[21px] font-medium leading-[1.22] tracking-[-0.02em] text-zinc-100 sm:text-[26px]">
        RLS policies are easy to misconfigure and{" "}
        <span className="relative whitespace-nowrap text-zinc-500">
          hard to audit visually
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 left-0 h-px w-full bg-gradient-to-r from-[#3ECF8E]/50 to-transparent"
          />
        </span>
        .
      </h2>
      <p className="mt-2 max-w-[52ch] text-[13px] leading-relaxed text-zinc-500">
        This makes both visible before you ship.{" "}
        <button
          onClick={onOpenGuide}
          className="inline-flex items-center gap-1 text-[#3ECF8E] underline decoration-[#3ECF8E]/30 underline-offset-2 transition hover:decoration-[#3ECF8E]"
        >
          New to RLS? Start here
          <ArrowRight className="h-3 w-3" />
        </button>
      </p>

      {hydrated && !dismissed && (
        <div className="panel-surface mt-4 overflow-hidden rounded-lg border border-[#1f1f23]">
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-controls="howto-steps"
              className="group flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-zinc-500 transition-transform duration-300",
                  expanded && "rotate-180"
                )}
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400 transition group-hover:text-zinc-200">
                How to use
              </span>
              <span className="truncate font-mono text-[10px] text-zinc-600">
                {STEPS.length} steps
              </span>
            </button>
            <button
              onClick={dismiss}
              aria-label="Dismiss how to use"
              title="Dismiss"
              className="shrink-0 rounded p-1 text-zinc-600 transition hover:bg-white/5 hover:text-zinc-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {expanded && (
            <ol
              id="howto-steps"
              className="grid gap-2 border-t border-[#1f1f23] p-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="reveal sunken flex gap-2.5 rounded-lg border border-[#1f1f23] p-2.5"
                  style={{ ["--i" as string]: i }}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#3ECF8E]/25 bg-[#3ECF8E]/10 font-mono text-[10px] text-[#3ECF8E]">
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
