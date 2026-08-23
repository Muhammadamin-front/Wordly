"use client";

export function SoundToggle({
  enabled,
  onToggle,
  labels,
}: {
  enabled: boolean;
  onToggle: () => void;
  labels: { on: string; off: string };
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={enabled ? labels.on : labels.off}
      aria-pressed={enabled}
      className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-card text-lg text-ink-soft transition-colors hover:text-ink"
    >
      <span aria-hidden>{enabled ? "🔊" : "🔇"}</span>
    </button>
  );
}
