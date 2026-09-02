import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "tactile-action relative isolate inline-flex items-center justify-center gap-2 overflow-hidden rounded-md border font-bold transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:pointer-events-none disabled:opacity-50 active:translate-x-0.5 active:translate-y-0.5 motion-reduce:transition-none cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary:
          "border-brand-950 bg-primary text-primary-contrast shadow-[3px_4px_0_#54250f] hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[5px_6px_0_#54250f] active:shadow-[1px_2px_0_#54250f]",
        secondary:
          "border-line bg-raised text-ink shadow-[2px_3px_0_rgb(84,37,15,0.18)] hover:-translate-y-0.5 hover:border-brand-500 hover:bg-sand-50 hover:text-primary hover:shadow-[4px_5px_0_rgb(84,37,15,0.24)] active:shadow-[1px_2px_0_rgb(84,37,15,0.16)]",
        accent:
          "border-accent-600 bg-accent-500 text-white shadow-[3px_4px_0_#315d5d] hover:-translate-y-0.5 hover:bg-accent-600 hover:shadow-[5px_6px_0_#315d5d] active:shadow-[1px_2px_0_#315d5d]",
        ghost: "border-transparent text-ink-soft hover:-translate-y-px hover:border-line hover:bg-hover hover:text-ink",
        danger: "border-[#7f1d1d] bg-danger text-white shadow-[3px_4px_0_#7f1d1d] hover:-translate-y-0.5 hover:brightness-95 hover:shadow-[5px_6px_0_#7f1d1d] active:shadow-[1px_2px_0_#7f1d1d]",
      },
      size: {
        sm: "min-h-11 min-w-11 px-4 text-sm sm:px-3.5",
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
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="relative z-10 size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  )
);
Button.displayName = "Button";
