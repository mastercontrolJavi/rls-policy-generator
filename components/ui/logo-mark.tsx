"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The same mark as the browser tab icon, drawn in currentColor with the
 * keyhole punched through so whatever sits behind it shows through.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-4 w-4", className)}
      aria-hidden="true"
      focusable="false"
    >
      <mask id={id}>
        <rect width="32" height="32" fill="black" />
        <g fill="white">
          <rect x="6.5" y="7.5" width="19" height="5" rx="2.2" />
          <rect x="6.5" y="14" width="19" height="5" rx="2.2" />
          <rect x="6.5" y="20.5" width="19" height="5" rx="2.2" />
        </g>
        <circle cx="16" cy="16.5" r="2.6" fill="black" />
      </mask>
      <rect
        width="32"
        height="32"
        fill="currentColor"
        mask={`url(#${id})`}
      />
    </svg>
  );
}
