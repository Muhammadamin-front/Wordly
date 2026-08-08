import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  centered = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  centered?: boolean;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        centered && "items-center text-center sm:flex-col sm:items-center",
        className
      )}
    >
      <div className={cn("min-w-0", centered && "mx-auto")}>
        {eyebrow && <p className="type-label text-accent-500">{eyebrow}</p>}
        <h1 className="type-h2 text-ink">{title}</h1>
        {subtitle && <p className="type-body-small mt-2 max-w-2xl text-ink-soft">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
