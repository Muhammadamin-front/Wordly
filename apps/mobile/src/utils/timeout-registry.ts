export type TimeoutRegistry = ReturnType<typeof createTimeoutRegistry>;

/** Own every delayed callback created by a mounted screen or game.
 * `clearAll` makes navigation/unmount deterministic: no stale completion,
 * sound, or state callback can fire after the user has left the surface. */
export function createTimeoutRegistry() {
  const handles = new Set<ReturnType<typeof setTimeout>>();

  const schedule = (callback: () => void, delayMs: number) => {
    const handle = setTimeout(() => {
      handles.delete(handle);
      callback();
    }, delayMs);
    handles.add(handle);
    return handle;
  };

  const clearAll = () => {
    handles.forEach((handle) => clearTimeout(handle));
    handles.clear();
  };

  return { schedule, clearAll, size: () => handles.size };
}
