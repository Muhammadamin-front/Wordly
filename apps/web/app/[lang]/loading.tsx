// No text: loading.tsx cannot read the [lang] route param (Next.js passes it
// no props), and a wordless spinner avoids guessing the visitor's locale.
export default function Loading() {
  return (
    <main className="flex min-h-[60svh] w-full items-center justify-center" aria-busy="true">
      <span
        aria-hidden
        className="size-10 animate-spin rounded-full border-3 border-brand-400/30 border-t-brand-600 dark:border-t-brand-300"
      />
      <span className="sr-only">Loading…</span>
    </main>
  );
}
