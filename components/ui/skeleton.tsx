import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded bg-[#1f1f23]", className)}
      aria-hidden="true"
    />
  );
}

/**
 * Placeholder that matches a Panel's dimensions, so resolving state from the
 * URL does not shift the layout once the real panels render.
 */
export function PanelSkeleton({
  title,
  rows,
  className,
}: {
  title: string;
  rows: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-[#1f1f23] bg-[#111114]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-[#1f1f23] px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
          {title}
        </h2>
        <Skeleton className="h-3 w-16" />
      </div>
      <div className="space-y-2 p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}
