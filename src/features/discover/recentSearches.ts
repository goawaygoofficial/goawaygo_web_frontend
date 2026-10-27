import type { Place, RecentSearch } from './types';

/**
 * Recent searches of a signed-out visitor, kept only in this browser (localStorage; the Privacy Policy says so).
 * Signed-in users' searches are kept by their account instead. Only places and spot names are stored, never
 * photos.
 */

const KEY = 'goawaygo.recentSearches';
/** Same as the account's history (backend SearchHistory.KEEP). */
export const MAX_RECENT_SEARCHES = 5;

function isRecentSearch(value: unknown): value is RecentSearch {
  if (typeof value !== 'object' || value === null) return false;
  const { place, spot } = value as Record<string, unknown>;
  if (typeof spot !== 'string' || typeof place !== 'object' || place === null) return false;
  const p = place as Record<string, unknown>;
  return (
    typeof p.name === 'string' &&
    typeof p.label === 'string' &&
    typeof p.type === 'string' &&
    typeof p.country === 'string' &&
    typeof p.lat === 'number' &&
    typeof p.lon === 'number'
  );
}

export function readRecentSearches(): RecentSearch[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isRecentSearch).slice(0, MAX_RECENT_SEARCHES) : [];
  } catch {
    return [];
  }
}

/** Puts the place first (once), keeping the newest 5. */
export function rememberSearch(place: Place, spot: string | undefined): void {
  const others = readRecentSearches().filter((entry) => entry.place.label !== place.label);
  const next = [{ place, spot: spot ?? place.name }, ...others].slice(0, MAX_RECENT_SEARCHES);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage full: the banner just won't remember this search.
  }
}
