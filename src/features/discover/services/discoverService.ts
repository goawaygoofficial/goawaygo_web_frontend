import { getCurrency } from '@/lib/i18n';
import { ApiError, apiRequest } from '@/lib/apiClient';
import { isRecord } from '@/lib/isRecord';
import type {
  BannerSlide,
  DestinationPage,
  Photo,
  Place,
  RecentSearch,
  SavedPlace,
  TripIdea,
} from '../types';

const UNEXPECTED = 'Unexpected response from the server.';

function isPlace(value: unknown): value is Place {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.label === 'string' &&
    typeof value.lat === 'number' &&
    typeof value.lon === 'number'
  );
}

function isPhoto(value: unknown): value is Photo {
  return isRecord(value) && typeof value.url === 'string' && typeof value.credit === 'string';
}

/** Keeps the entries that have the expected shape, so one odd entry can't break a whole list. */
function listOf<T>(data: unknown, isItem: (item: unknown) => item is T): T[] {
  if (!Array.isArray(data)) throw new ApiError(UNEXPECTED, 200);
  return data.filter(isItem);
}

/** Up to 6 real places matching what the user is typing (at least 2 characters). */
export async function suggestPlaces(text: string, signal?: AbortSignal): Promise<Place[]> {
  const data = await apiRequest<unknown>(`/api/discover/places?q=${encodeURIComponent(text)}`, {
    fallbackError: 'Could not search places.',
    signal,
  });
  return listOf(data, isPlace);
}

/** Which place to open: a picked suggestion (preferred) or what the user typed. */
export type DestinationQuery = { placeId: string } | { text: string };

/**
 * The whole destination page, sent only when it is ready (usually 10-20 s: the AI writes the cards meanwhile).
 * Signed in, the search is added to the account's recent searches.
 */
export async function getDestination(
  query: DestinationQuery,
  signal?: AbortSignal,
): Promise<DestinationPage> {
  const param =
    'placeId' in query
      ? `placeId=${encodeURIComponent(query.placeId)}`
      : `q=${encodeURIComponent(query.text)}`;
  // The exchange rate on the money card is against the traveller's currency.
  const currency = `currency=${encodeURIComponent(getCurrency())}`;
  const data = await apiRequest<unknown>(`/api/discover/destination?${param}&${currency}`, {
    fallbackError: 'Could not open this destination.',
    signal,
  });
  if (!isRecord(data) || !isPlace(data.place) || !Array.isArray(data.cards)) {
    throw new ApiError(UNEXPECTED, 200);
  }
  return data as unknown as DestinationPage;
}

function isSlide(value: unknown): value is BannerSlide {
  return (
    isRecord(value) &&
    isPlace(value.place) &&
    typeof value.spot === 'string' &&
    (value.photo === null || isPhoto(value.photo))
  );
}

/** The signed-in user's last 5 searched places, newest first, each with a live photo. */
export async function getRecentSearches(signal?: AbortSignal): Promise<BannerSlide[]> {
  const data = await apiRequest<unknown>('/api/discover/recent', {
    fallbackError: 'Could not load your recent searches.',
    signal,
  });
  return listOf(data, isSlide);
}

/** Live photos for searches kept on this device (signed out). The slides keep the device's own places. */
export async function getPhotosFor(
  searches: readonly RecentSearch[],
  signal?: AbortSignal,
): Promise<BannerSlide[]> {
  if (searches.length === 0) return [];
  const data = await apiRequest<unknown>('/api/discover/photos', {
    method: 'POST',
    body: {
      items: searches.map(({ place, spot }) => ({
        spot,
        place: place.name,
        type: place.type,
        country: place.country,
        lat: place.lat,
        lon: place.lon,
      })),
    },
    fallbackError: 'Could not load photos.',
    signal,
  });
  if (!Array.isArray(data)) throw new ApiError(UNEXPECTED, 200);
  return searches.map((search, index) => {
    const slide: unknown = data[index];
    const photo = isRecord(slide) && isPhoto(slide.photo) ? slide.photo : null;
    return { place: search.place, spot: search.spot, photo };
  });
}

function isIdea(value: unknown): value is TripIdea {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.country === 'string' &&
    isPhoto(value.photo)
  );
}

/** Random ideas for the next trip from the backend's hourly pool (empty while none are ready). */
export async function getTripIdeas(count: number, signal?: AbortSignal): Promise<TripIdea[]> {
  const data = await apiRequest<unknown>(`/api/discover/ideas?count=${String(count)}`, {
    fallbackError: 'Could not load ideas.',
    signal,
  });
  return listOf(data, isIdea);
}

function isSavedPlace(value: unknown): value is SavedPlace {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    typeof value.key === 'string' &&
    typeof value.name === 'string'
  );
}

/** My Trips, newest first (signed in). */
export async function listSavedPlaces(signal?: AbortSignal): Promise<SavedPlace[]> {
  const data = await apiRequest<unknown>('/api/me/saved-places', {
    fallbackError: 'Could not load My Trips.',
    signal,
  });
  return listOf(data, isSavedPlace);
}

/** Saves an idea to My Trips; saving it again changes nothing. */
export async function saveIdea(idea: TripIdea): Promise<void> {
  await apiRequest<unknown>('/api/me/saved-places', {
    method: 'POST',
    body: {
      key: idea.id,
      name: idea.name,
      area: idea.area,
      country: idea.country,
      lat: idea.lat,
      lon: idea.lon,
      category: idea.category,
    },
    expectedStatus: 204,
    fallbackError: 'Could not save this place.',
  });
}

export async function removeSavedPlace(id: number): Promise<void> {
  await apiRequest<unknown>(`/api/me/saved-places/${String(id)}`, {
    method: 'DELETE',
    expectedStatus: 204,
    fallbackError: 'Could not remove this place.',
  });
}
