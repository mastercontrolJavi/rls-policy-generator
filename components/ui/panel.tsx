import type { Explainer } from "@/lib/help";
import { cn } from "@/lib/utils";
import { InfoPopover } from "./info-popover";

interface PanelProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Lights the header rule in the accent, marking the panel that pays off. */
  primary?: boolean;
  /** Explains what the panel is for, shown behind a help icon in the header. */
  help?: Explainer;
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  primary = false,
  help,
}: PanelProps) {
  return (
    <div
      className={cn(
        "panel-surface relative overflow-hidden rounded-xl border border-[#1f1f23]",
        className
      )}
    >
      <div className="panel-header relative flex items-center justify-between gap-3 border-b border-[#1f1f23] px-4 py-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="font-mono text-[10.5px] font-medium uppercase tracking-[0.18em] text-zinc-300">
            {title}
          </h2>
          {help && <InfoPopover explainer={help} className="self-center" />}
          {subtitle && (
            <span className="truncate text-[11px] text-zinc-600">
              {subtitle}
            </span>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}

        {/* Hairline of light along the header rule. */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 bottom-0 h-px",
            primary
              ? "bg-gradient-to-r from-[#3ECF8E]/60 via-[#3ECF8E]/15 to-transparent"
              : "bg-gradient-to-r from-white/[0.07] to-transparent"
          )}
        />
      </div>
      {children}
    </div>
  );
}
