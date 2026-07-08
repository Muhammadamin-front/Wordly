import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-line bg-card px-4 text-sm text-ink placeholder:text-ink-soft/60",
        "transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30",
        "aria-invalid:border-danger aria-invalid:ring-danger/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
