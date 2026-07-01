"use client";

import { useEffect, useState } from "react";

/**
 * Shows a brief loading state when the component mounts (e.g. on navigating to
 * an analytics page), so charts render their skeletons before the (synchronous)
 * mock data appears. setState is only called from the timer callback.
 */
export function useSimulatedLoading(ms = 500) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
