"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import type { Explainer } from "@/lib/help";
import { cn } from "@/lib/utils";

const GAP = 8;
const WIDTH = 288;
const ESTIMATED_HEIGHT = 170;
const HOVER_DELAY = 200;

/**
 * Replaces the native `title` attribute, which only appears on hover, never
 * on touch, and cannot hold more than a short string. Rendered in a fixed
 * layer so a panel's overflow cannot clip it.
 *
 * Hovering shows it transiently; clicking or pressing Enter pins it open.
 * Pinning is tracked separately from hovering because a pointer click also
 * fires focus, and a single toggle flag would be flipped twice by one click.
 */
export function InfoPopover({
  explainer,
  label,
  className,
  iconClassName,
  children,
}: {
  explainer: Explainer;
  label?: string;
  className?: string;
  iconClassName?: string;
  children?: React.ReactNode;
}) {
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);
  const id = useId();

  const open = pinned || hovering;

  const dismiss = () => {
    window.clearTimeout(hoverTimer.current);
    setPinned(false);
    setHovering(false);
  };

  useLayoutEffect(() => {
    if (!open) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const left = Math.min(
      Math.max(GAP, rect.left + rect.width / 2 - WIDTH / 2),
      Math.max(GAP, window.innerWidth - WIDTH - GAP)
    );
    // Flip above the trigger when there is not enough room below it.
    const below = rect.bottom + GAP;
    const fitsBelow = window.innerHeight - below >= ESTIMATED_HEIGHT;
    setPos({
      top: fitsBelow ? below : Math.max(GAP, rect.top - ESTIMATED_HEIGHT - GAP),
      left,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    const onPointer = (e: PointerEvent) => {
      if (!triggerRef.current?.contains(e.target as Node)) dismiss();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label ?? `What is ${explainer.title}?`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={(e) => {
          e.stopPropagation();
          window.clearTimeout(hoverTimer.current);
          if (pinned) {
            dismiss();
          } else {
            setPinned(true);
          }
        }}
        onMouseEnter={() => {
          hoverTimer.current = window.setTimeout(
            () => setHovering(true),
            HOVER_DELAY
          );
        }}
        onMouseLeave={() => {
          window.clearTimeout(hoverTimer.current);
          setHovering(false);
        }}
        className={cn(
          "shrink-0 rounded text-zinc-600 transition-colors hover:text-[#3ECF8E] focus-visible:text-[#3ECF8E] focus-visible:outline-none",
          open && "text-[#3ECF8E]",
          className
        )}
      >
        {children ?? <HelpCircle className={cn("h-3 w-3", iconClassName)} />}
      </button>

      {open && pos && (
        <div
          id={id}
          role="tooltip"
          style={{ top: pos.top, left: pos.left, width: WIDTH }}
          className="dialog-in panel-surface pointer-events-none fixed z-50 rounded-lg border border-[#2c2c34] p-3 normal-case tracking-normal"
        >
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#3ECF8E]">
            {explainer.title}
          </p>
          <p className="mt-1.5 font-sans text-[11.5px] font-normal leading-relaxed text-zinc-300">
            {explainer.body}
          </p>
          {explainer.example && (
            <p className="sunken mt-2 overflow-x-auto rounded border border-[#1f1f23] p-2 font-mono text-[10.5px] leading-relaxed text-[#3ECF8E]">
              {explainer.example}
            </p>
          )}
        </div>
      )}
    </>
  );
}
