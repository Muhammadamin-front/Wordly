import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg font-bold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-focus/35 focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white shadow-[0_12px_28px_rgba(7,58,53,0.18)] hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_18px_38px_rgba(7,58,53,0.22)] dark:text-brand-950",
        secondary:
          "border border-line bg-raised/78 text-ink shadow-[0_8px_20px_rgba(34,65,58,0.055)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-brand-400/60 hover:bg-hover hover:text-primary",
        accent:
          "bg-accent-500 text-white shadow-[0_12px_28px_rgba(184,137,47,0.16)] hover:-translate-y-0.5 hover:bg-accent-600",
        ghost: "text-ink-soft hover:bg-hover hover:text-ink",
        danger: "bg-danger text-white shadow-[0_12px_28px_rgba(220,38,38,0.16)] hover:-translate-y-0.5 hover:brightness-95",
      },
      size: {
        sm: "min-h-11 px-4 text-sm sm:min-h-9 sm:px-3.5",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base shadow-2xl",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, fullWidth }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";
