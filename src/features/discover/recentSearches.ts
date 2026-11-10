import type { Place, RecentSearch } from './types';

/**
 * Places a signed-out visitor opened, kept only in this browser (localStorage; the Privacy Policy says so): the
 * newest 5 make the Home banner, the newest 30 their Recently viewed. Signed-in users' places are kept by their
 * account instead. Only places and spot names are stored, never photos.
 */

const KEY = 'goawaygo.recentSearches';
/** The Home banner (backend SearchHistory.BANNER). */
export const MAX_RECENT_SEARCHES = 5;
/** Recently viewed (backend SearchHistory.KEEP). */
export const MAX_REMEMBERED_PLACES = 30;

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

/** The newest `limit` places (the banner's 5 by default). */
export function readRecentSearches(limit: number = MAX_RECENT_SEARCHES): RecentSearch[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isRecentSearch).slice(0, limit) : [];
  } catch {
    return [];
  }
}

/** Puts the place first (once), keeping the newest 30. */
export function rememberSearch(place: Place, spot: string | undefined): void {
  const others = readRecentSearches(MAX_REMEMBERED_PLACES).filter(
    (entry) => entry.place.label !== place.label,
  );
  const next = [
    { place, spot: spot ?? place.name, viewedAt: new Date().toISOString() },
    ...others,
  ].slice(0, MAX_REMEMBERED_PLACES);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode or storage full: the banner just won't remember this search.
  }
}

/** Forgets every place (Recently viewed's Clear). */
export function forgetRecentSearches(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Storage unavailable: nothing was remembered.
  }
}
