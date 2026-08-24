export default function GrammarLessonLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 animate-pulse px-4 py-8 sm:px-6">
      <div className="h-11 w-44 rounded-lg bg-line/60" />
      <section className="surface-panel mt-5 rounded-lg p-6 sm:p-8">
        <div className="h-4 w-28 rounded bg-line/60" />
        <div className="mt-5 h-12 max-w-2xl rounded bg-line/60" />
        <div className="mt-3 h-5 max-w-md rounded bg-line/50" />
      </section>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-36 rounded-lg border border-line bg-card/50" />)}</div>
        <div className="h-72 rounded-lg border border-line bg-card/50" />
      </div>
    </main>
  );
}
