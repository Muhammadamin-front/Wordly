import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  body,
  actionLabel,
  actionHref,
  onAction,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}) {
  const action =
    actionLabel && actionHref ? (
      <Link href={actionHref}>
        <Button size="sm">
          {actionLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </Link>
    ) : actionLabel && onAction ? (
      <Button size="sm" onClick={onAction}>
        {actionLabel}
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    ) : null;

  return (
    <section
      className={cn(
        "surface-panel rounded-[24px] p-6 text-center sm:p-8",
        className
      )}
    >
      {Icon && (
        <span className="icon-tile mx-auto flex size-12 items-center justify-center rounded-[18px] text-primary">
          <Icon className="size-6" aria-hidden />
        </span>
      )}
      <h2 className="type-h3 mt-4 text-ink">{title}</h2>
      <p className="type-body-small mx-auto mt-2 max-w-md text-ink-soft">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </section>
  );
}
