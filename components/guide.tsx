"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, X } from "lucide-react";
import { GUIDE } from "@/lib/help";
import type { GuideBlock } from "@/lib/help";
import { cn } from "@/lib/utils";

export function Guide({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [active, setActive] = useState(GUIDE[0].id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      restoreFocus.current = document.activeElement as HTMLElement | null;
      setActive(GUIDE[0].id);
      const id = window.requestAnimationFrame(() => closeRef.current?.focus());
      return () => window.cancelAnimationFrame(id);
    }
    restoreFocus.current?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Highlight whichever section is currently under the top of the scroller.
  const onScroll = () => {
    const root = scrollRef.current;
    if (!root) return;
    const top = root.getBoundingClientRect().top;
    let current = GUIDE[0].id;
    for (const section of GUIDE) {
      const el = root.querySelector(`#guide-${section.id}`);
      if (el && el.getBoundingClientRect().top - top <= 24) current = section.id;
    }
    setActive(current);
  };

  const jump = (id: string) => {
    setActive(id);
    const root = scrollRef.current;
    const el = root?.querySelector(`#guide-${id}`);
    if (!root || !el) return;
    root.scrollTo({
      top: root.scrollTop + (el.getBoundingClientRect().top - root.getBoundingClientRect().top) - 8,
      behavior: "smooth",
    });
  };

  if (!open) return null;

  return (
    <div
      className="overlay-in fixed inset-0 z-50 flex items-start justify-center bg-black/75 px-4 py-[6vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-heading"
        className="dialog-in panel-surface flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-[#2c2c34]"
      >
        <div className="flex items-center gap-2.5 border-b border-[#1f1f23] px-4 py-3">
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#3ECF8E]" />
          <h2
            id="guide-heading"
            className="min-w-0 flex-1 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-200"
          >
            Row Level Security, start to finish
          </h2>
          <button
            ref={closeRef}
            onClick={() => onOpenChange(false)}
            aria-label="Close guide"
            className="shrink-0 rounded p-1 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <nav
            aria-label="Guide sections"
            className="scrollbar-thin hidden w-52 shrink-0 overflow-y-auto border-r border-[#1f1f23] p-2 md:block"
          >
            {GUIDE.map((section, i) => (
              <button
                key={section.id}
                onClick={() => jump(section.id)}
                className={cn(
                  "flex w-full items-baseline gap-2 rounded-md px-2.5 py-1.5 text-left text-[11.5px] leading-snug transition-colors",
                  active === section.id
                    ? "bg-[#3ECF8E]/[0.12] text-[#3ECF8E]"
                    : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
                )}
              >
                <span className="font-mono text-[9.5px] opacity-60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0">{section.title}</span>
              </button>
            ))}
          </nav>

          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="scrollbar-thin min-w-0 flex-1 overflow-y-auto px-5 py-4"
          >
            {GUIDE.map((section, i) => (
              <section
                key={section.id}
                id={`guide-${section.id}`}
                className={cn(i > 0 && "mt-7 border-t border-[#1f1f23] pt-6")}
              >
                <h3 className="flex items-baseline gap-2 text-[15px] font-medium tracking-tight text-zinc-100">
                  <span className="font-mono text-[10px] text-[#3ECF8E]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {section.title}
                </h3>
                <div className="mt-2.5 space-y-2.5">
                  {section.blocks.map((block, k) => (
                    <Block key={k} block={block} />
                  ))}
                </div>
              </section>
            ))}
            <p className="mt-7 border-t border-[#1f1f23] pt-4 text-[11px] text-zinc-600">
              Close this and the tool is behind it. Every control has a help
              icon with the same explanations in context.
            </p>
            <div aria-hidden="true" className="h-[45vh]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ block }: { block: GuideBlock }) {
  if (block.kind === "code") {
    return (
      <pre className="sunken scrollbar-thin overflow-x-auto rounded-lg border border-[#1f1f23] p-3 font-mono text-[11.5px] leading-relaxed text-[#3ECF8E]">
        {block.text}
      </pre>
    );
  }

  if (block.kind === "note") {
    return (
      <p className="rounded-lg border border-amber-500/25 bg-amber-500/[0.07] p-2.5 text-[12px] leading-relaxed text-amber-200/90">
        {block.text}
      </p>
    );
  }

  if (block.kind === "list") {
    return (
      <ul className="space-y-1.5">
        {block.items?.map((item, i) => (
          <li
            key={i}
            className="flex gap-2.5 text-[12.5px] leading-relaxed text-zinc-400"
          >
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#3ECF8E]/70" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-[12.5px] leading-relaxed text-zinc-400">{block.text}</p>
  );
}
