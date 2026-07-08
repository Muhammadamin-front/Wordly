import { type HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const styles = {
  error: "border-danger/30 bg-danger/8 text-danger",
  success: "border-success/30 bg-success/8 text-success",
  info: "border-brand-400/30 bg-brand-400/8 text-brand-600 dark:text-brand-300",
} as const;

export function Alert({
  tone = "info",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: keyof typeof styles }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm font-medium leading-relaxed",
        styles[tone],
        className
      )}
      {...props}
    />
  );
}
