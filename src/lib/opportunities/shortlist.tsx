'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

interface ShortlistContextValue {
  shortlistedIds: string[];
  isShortlisted: (id: string) => boolean;
  toggleShortlist: (id: string) => void;
  removeFromShortlist: (id: string) => void;
  clearShortlist: () => void;
}

const SHORTLIST_KEY = 'sponsorseek_shortlisted_opportunity_ids';
const fallbackShortlistContext: ShortlistContextValue = {
  shortlistedIds: [],
  isShortlisted: () => false,
  toggleShortlist: () => undefined,
  removeFromShortlist: () => undefined,
  clearShortlist: () => undefined,
};

const ShortlistContext = createContext<ShortlistContextValue>(fallbackShortlistContext);

function readStoredShortlist(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(SHORTLIST_KEY) || '[]') as unknown;
    if (!Array.isArray(parsed)) return [];

    return Array.from(new Set(parsed.filter((id): id is string => typeof id === 'string' && id.trim().length > 0)));
  } catch {
    return [];
  }
}

interface ShortlistProviderProps {
  children: ReactNode;
}

export function ShortlistProvider({ children }: ShortlistProviderProps) {
  const [shortlistedIds, setShortlistedIds] = useState<string[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setShortlistedIds(readStoredShortlist());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(shortlistedIds));
  }, [hasHydrated, shortlistedIds]);

  const value = useMemo<ShortlistContextValue>(() => ({
    shortlistedIds,
    isShortlisted: (id: string) => shortlistedIds.includes(id),
    toggleShortlist: (id: string) => {
      setShortlistedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    },
    removeFromShortlist: (id: string) => {
      setShortlistedIds((current) => current.filter((item) => item !== id));
    },
    clearShortlist: () => setShortlistedIds([]),
  }), [shortlistedIds]);

  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>;
}

export function useShortlist(): ShortlistContextValue {
  return useContext(ShortlistContext);
}
