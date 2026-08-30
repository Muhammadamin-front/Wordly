"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentType, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type IconType = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

/** Pill field for the auth screens: label above, icon inside the leading edge,
 *  and an optional reveal toggle for passwords.
 *
 *  These screens use their own field rather than the shared <Input> because the
 *  auth card runs on its own paper palette — the app's translucent, tinted
 *  surfaces read as muddy against it.
 */
export function AuthField({
  label,
  icon: Icon,
  reveal = false,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon: IconType;
  reveal?: boolean;
}) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-[0.8rem] font-semibold text-auth-ink/78"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 z-10 size-[1.05rem] -translate-y-1/2 text-auth-muted"
          aria-hidden
        />
        <input
          id={fieldId}
          type={reveal && visible ? "text" : props.type}
          className={cn(
            "h-[3.15rem] w-full rounded-full border border-auth-line bg-auth-field pl-12 text-[0.95rem] font-medium text-auth-ink",
            "transition-colors duration-200 placeholder:text-auth-muted/60",
            "hover:border-auth-ink/34 focus:border-auth-primary focus:outline-none focus:ring-4 focus:ring-auth-primary/12",
            "aria-invalid:border-danger aria-invalid:ring-danger/15",
            reveal ? "pr-12" : "pr-5",
            className
          )}
          {...props}
        />
        {reveal && (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-auth-muted transition-colors hover:bg-auth-ink/6 hover:text-auth-ink"
          >
            {visible ? (
              <EyeOff className="size-[1.05rem]" aria-hidden />
            ) : (
              <Eye className="size-[1.05rem]" aria-hidden />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

/** Full-width dark-green pill used for the primary auth action. */
export function AuthSubmit({
  loading,
  children,
}: {
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "inline-flex h-[3.15rem] w-full items-center justify-center gap-2 rounded-full bg-auth-primary text-[0.95rem] font-semibold text-white",
        "transition-colors duration-200 hover:bg-auth-primary-hover",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-auth-primary/25",
        "disabled:cursor-not-allowed disabled:opacity-60"
      )}
    >
      {loading && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
