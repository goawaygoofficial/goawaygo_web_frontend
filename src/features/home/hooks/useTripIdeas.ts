import { useEffect, useState } from 'react';
import { getTripIdeas } from '@/features/discover';
import type { TripIdea } from '@/features/discover';

const IDEA_COUNT = 6;
/** A new random set every minute, as decided for 4.1. */
const REFRESH_MS = 60_000;

/**
 * Random ideas for the next trip, replaced every minute while the page is visible. `null` until the first set
 * arrives; a failed refresh keeps the current set.
 */
export function useTripIdeas(): TripIdea[] | null {
  const [ideas, setIdeas] = useState<TripIdea[] | null>(null);

  useEffect(() => {
    let controller = new AbortController();
    const load = () => {
      controller.abort();
      controller = new AbortController();
      const { signal } = controller;
      getTripIdeas(IDEA_COUNT, signal)
        .then((next) => {
          // Keep showing the current set if the backend has none right now.
          setIdeas((current) => (next.length > 0 || current === null ? next : current));
        })
        .catch(() => {
          if (!signal.aborted) setIdeas((current) => current ?? []);
        });
    };
    load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, REFRESH_MS);
    return () => {
      window.clearInterval(timer);
      controller.abort();
    };
  }, []);

  return ideas;
}
