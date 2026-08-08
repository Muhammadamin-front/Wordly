import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border border-line bg-card/72 px-4 text-sm font-medium text-ink shadow-inner shadow-brand-950/5 backdrop-blur-xl placeholder:text-ink-soft/55",
        "transition-all duration-200 hover:border-brand-400/35 focus:border-brand-400 focus:bg-raised focus:outline-none focus:ring-2 focus:ring-focus/25",
        "disabled:cursor-not-allowed disabled:border-line disabled:bg-disabled/10 disabled:text-ink-soft/60",
        "aria-invalid:border-danger aria-invalid:ring-danger/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
