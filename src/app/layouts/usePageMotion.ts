import { useState } from 'react';
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom';
import { routes } from '@/lib/routes';

/**
 * How the page that just opened should come in:
 * - `tabLeft` / `tabRight`: switching tabs, from the side of the tab you came from;
 * - `back`: Back (or the browser's back button), from the left;
 * - `forward`: anything opened from a page, from the right;
 * - `none`: the first page, and links that morph a photo into the next page (see `MorphLink`).
 */
export type PageMotion = 'none' | 'forward' | 'back' | 'tabLeft' | 'tabRight';

const TABS: readonly string[] = [routes.home, routes.trips, routes.wanderbook, routes.profile];

/** Navigation state set by `MorphLink`: the shared photo carries the motion instead of the page. */
export interface MorphState {
  morph?: boolean;
}

function motionBetween(from: string, to: string, pop: boolean, morph: boolean): PageMotion {
  if (morph) return 'none';
  const fromTab = TABS.indexOf(from);
  const toTab = TABS.indexOf(to);
  if (fromTab >= 0 && toTab >= 0 && fromTab !== toTab)
    return toTab > fromTab ? 'tabRight' : 'tabLeft';
  return pop ? 'back' : 'forward';
}

/**
 * The page's key (a page's own sub-pages, like Profile's sign-in forms, count as the same page, so they don't
 * replay it) and how it comes in.
 */
export function usePageMotion(): { key: string; motion: PageMotion } {
  const location = useLocation();
  const navigationType = useNavigationType();
  const key = location.pathname.startsWith(`${routes.profile}/`)
    ? routes.profile
    : location.pathname;
  const [previous, setPrevious] = useState(key);
  // A layout that just appeared (e.g. a page over the tabs opened, or Back to the tabs): play the way it was reached,
  // but not on the very first page of the visit (history entry 0).
  const [motion, setMotion] = useState<PageMotion>(() => {
    const firstEntry = (window.history.state as { idx?: number } | null)?.idx === 0;
    const morph = (location.state as MorphState | null)?.morph === true;
    if (firstEntry || morph) return 'none';
    return navigationType === NavigationType.Pop ? 'back' : 'forward';
  });

  // Worked out while rendering the new page (React's "state from the previous render" pattern), so the first
  // frame of the new page already has its animation.
  if (previous !== key) {
    const morph = (location.state as MorphState | null)?.morph === true;
    setPrevious(key);
    setMotion(motionBetween(previous, key, navigationType === NavigationType.Pop, morph));
  }
  return { key, motion };
}
