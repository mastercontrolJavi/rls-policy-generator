import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-10 text-center",
        className
      )}
    >
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md border border-[#1f1f23] bg-[#0a0a0b] text-zinc-600">
        {icon}
      </div>
      <p className="text-xs font-medium text-zinc-300">{title}</p>
      <p className="mt-1 max-w-[36ch] text-[11px] leading-relaxed text-zinc-600">
        {body}
      </p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
