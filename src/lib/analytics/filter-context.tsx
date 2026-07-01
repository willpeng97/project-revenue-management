"use client";

import { createContext, useContext, useState, useCallback } from "react";
import {
  type AnalyticsFilters,
  type DatePreset,
  DEFAULT_FILTERS,
  PRESET_MONTHS,
} from "./selectors";

interface FilterContextValue {
  filters: AnalyticsFilters;
  setPreset: (preset: DatePreset) => void;
  setFilter: <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => void;
  reset: () => void;
  refreshKey: number;
  refresh: () => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function AnalyticsFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<AnalyticsFilters>(DEFAULT_FILTERS);
  const [refreshKey, setRefreshKey] = useState(0);

  const setPreset = useCallback((preset: DatePreset) => {
    setFilters((f) => ({ ...f, preset, months: PRESET_MONTHS[preset] }));
  }, []);

  const setFilter = useCallback(
    <K extends keyof AnalyticsFilters>(key: K, value: AnalyticsFilters[K]) => {
      setFilters((f) => ({ ...f, [key]: value }));
    },
    []
  );

  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <FilterContext.Provider value={{ filters, setPreset, setFilter, reset, refreshKey, refresh }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useAnalyticsFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useAnalyticsFilters must be used within AnalyticsFilterProvider");
  return ctx;
}
