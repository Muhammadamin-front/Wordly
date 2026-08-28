import { useEffect, useRef } from "react";

import { createTimeoutRegistry } from "@/utils/timeout-registry";

export function useTimeoutRegistry() {
  const registry = useRef<ReturnType<typeof createTimeoutRegistry> | null>(null);
  if (!registry.current) registry.current = createTimeoutRegistry();

  useEffect(() => {
    const current = registry.current;
    return () => current?.clearAll();
  }, []);

  return registry.current;
}
