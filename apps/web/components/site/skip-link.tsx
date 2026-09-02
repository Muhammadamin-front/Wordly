"use client";

export function SkipLink({ label }: { label: string }) {
  return (
    <nav aria-label={label}>
      <a
        href="#main-content"
        onClick={(event) => {
          const target = document.getElementById("main-content");
          if (!target) return;
          event.preventDefault();
          target.focus();
        }}
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg border-2 border-brand-950 bg-primary px-4 py-3 text-sm font-black text-primary-contrast shadow-[3px_4px_0_#54250f] transition-transform focus:translate-y-0 motion-reduce:transition-none"
      >
        {label}
      </a>
    </nav>
  );
}
