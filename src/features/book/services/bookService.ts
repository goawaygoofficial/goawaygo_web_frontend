import { ApiError, apiRequest } from '@/lib/apiClient';
import { isRecord } from '@/lib/isRecord';
import type {
  Airport,
  CarSearch,
  Fare,
  FlightResults,
  FlightSearch,
  PartnerCard,
  StaySearch,
} from '../types';

const UNEXPECTED = 'Unexpected response from the server.';

/** Prices shown in Indian rupees for now (India first); every currency later (4.7). */
export const CURRENCY = 'INR';

function isAirport(value: unknown): value is Airport {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.name === 'string' &&
    (value.type === 'city' || value.type === 'airport')
  );
}

function isFare(value: unknown): value is Fare {
  return (
    isRecord(value) &&
    typeof value.price === 'number' &&
    typeof value.departAt === 'string' &&
    typeof value.link === 'string' &&
    typeof value.airline === 'string'
  );
}

function isPartner(value: unknown): value is PartnerCard {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.link === 'string'
  );
}

function listOf<T>(data: unknown, isItem: (item: unknown) => item is T): T[] {
  if (!Array.isArray(data)) throw new ApiError(UNEXPECTED, 200);
  return data.filter(isItem);
}

/** Cities and airports matching what the user is typing (at least 2 characters). */
export async function suggestAirports(text: string, signal?: AbortSignal): Promise<Airport[]> {
  const data = await apiRequest<unknown>(`/api/book/airports?q=${encodeURIComponent(text)}`, {
    fallbackError: 'Could not search airports.',
    signal,
  });
  return listOf(data, isAirport);
}

/** Recent fares for a trip, cheaper dates that month and the link to the partner's live search. */
export async function searchFlights(
  search: FlightSearch,
  signal?: AbortSignal,
): Promise<FlightResults> {
  const params = new URLSearchParams({
    from: search.from,
    to: search.to,
    depart: search.depart,
    adults: String(search.adults),
    currency: CURRENCY,
    channel: 'web',
  });
  if (search.returnDate) params.set('return', search.returnDate);
  const data = await apiRequest<unknown>(`/api/book/flights?${params.toString()}`, {
    fallbackError: 'Could not find flight prices.',
    signal,
  });
  if (!isRecord(data) || typeof data.searchLink !== 'string' || typeof data.currency !== 'string') {
    throw new ApiError(UNEXPECTED, 200);
  }
  return {
    priceKind: 'recent',
    currency: data.currency,
    onDate: listOf(data.onDate, isFare),
    nearby: listOf(data.nearby, isFare),
    searchLink: data.searchLink,
  };
}

/** Hotel partners opened on the place and dates. */
export async function stayPartners(
  search: StaySearch,
  signal?: AbortSignal,
): Promise<PartnerCard[]> {
  const params = new URLSearchParams({
    place: search.place,
    checkin: search.checkin,
    checkout: search.checkout,
    adults: String(search.adults),
    rooms: String(search.rooms),
    currency: CURRENCY,
    channel: 'web',
  });
  const data = await apiRequest<unknown>(`/api/book/stays?${params.toString()}`, {
    fallbackError: 'Could not open hotel partners.',
    signal,
  });
  return listOf(data, isPartner);
}

/** Car rental partners opened on the pick-up place and dates. */
export async function carPartners(search: CarSearch, signal?: AbortSignal): Promise<PartnerCard[]> {
  const params = new URLSearchParams({
    place: search.place,
    pickup: search.pickup,
    dropoff: search.dropoff,
    currency: CURRENCY,
    channel: 'web',
  });
  if (search.airport) params.set('airport', search.airport);
  const data = await apiRequest<unknown>(`/api/book/cars?${params.toString()}`, {
    fallbackError: 'Could not open car rental partners.',
    signal,
  });
  return listOf(data, isPartner);
}
