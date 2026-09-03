"use client";

import { FlickeringGrid } from "@/components/ui/flickering-grid";

/**
 * Page backdrop. Replaces the static engineering grid with a flickering one,
 * masked out before it reaches the content so panels stay readable. Colors
 * come from the existing palette: --muted squares over --bg.
 */
export function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        WebkitMaskImage: "linear-gradient(to bottom, #000 0%, transparent 55%)",
        maskImage: "linear-gradient(to bottom, #000 0%, transparent 55%)",
      }}
    >
      <FlickeringGrid
        className="absolute inset-0 size-full"
        squareSize={4}
        gridGap={6}
        color="#6b6b73"
        maxOpacity={0.22}
        flickerChance={0.08}
      />
    </div>
  );
}
