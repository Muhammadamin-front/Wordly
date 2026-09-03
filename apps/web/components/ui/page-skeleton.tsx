import { Skeleton } from "@/components/ui/skeleton";

/** The shape of a hub page while it loads: a header block, then a grid of
 *  cards. Shown instead of a centred spinner, which on a slow connection
 *  reads as a broken app rather than a loading one — the page keeps its
 *  layout, so nothing jumps when the data lands. */
export function PageSkeleton({
  label,
  cards = 4,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  /** Announced to screen readers, which see no visual placeholder at all. */
  label: string;
  cards?: number;
  columns?: string;
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      aria-busy="true"
      aria-label={label}
      className="mx-auto w-full max-w-(--app-container-width) flex-1 px-4 py-8 sm:px-6 lg:py-10"
    >
      <Skeleton className="h-8 w-56 max-w-full" />
      <Skeleton className="mt-3 h-4 w-80 max-w-full" />
      <div className={`mt-8 grid gap-4 ${columns}`}>
        {Array.from({ length: cards }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
