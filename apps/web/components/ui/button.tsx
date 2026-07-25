import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg font-bold transition-all duration-300 disabled:pointer-events-none disabled:opacity-55 active:scale-[0.98] cursor-pointer select-none before:absolute before:inset-0 before:-z-10 before:translate-x-[-120%] before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-[120%]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-brand-400 via-brand-600 to-brand-900 text-white shadow-[0_16px_44px_rgba(50,108,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(50,108,255,0.42)]",
        secondary:
          "border border-line bg-card/72 text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_34px_rgba(10,17,36,0.08)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-brand-400/70 hover:bg-raised/86 hover:text-brand-600 dark:hover:text-brand-200",
        accent:
          "bg-gradient-to-br from-accent-300 via-accent-500 to-emerald-700 text-white shadow-[0_16px_44px_rgba(16,201,150,0.28)] hover:-translate-y-0.5 hover:shadow-[0_24px_64px_rgba(16,201,150,0.36)]",
        ghost: "text-ink-soft hover:-translate-y-0.5 hover:bg-card/64 hover:text-ink",
        danger: "bg-gradient-to-br from-danger to-rose-700 text-white shadow-lg shadow-danger/25 hover:-translate-y-0.5",
      },
      size: {
        sm: "h-9 px-3.5 text-sm",
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
