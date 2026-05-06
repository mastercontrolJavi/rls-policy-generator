import { cn } from "@/lib/utils";

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: PanelProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-[#1f1f23] bg-[#111114]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-[#1f1f23] px-4 py-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            {title}
          </h2>
          {subtitle && (
            <span className="truncate text-xs text-zinc-600">· {subtitle}</span>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
