import { addDays, toIsoDate } from '@/lib/date';
import { carQuery, stayQuery } from '@/features/book';
import { routes } from '@/lib/routes';
import type { BudgetLevel, Interest, Pace, Plan, PlanPlace, Travellers } from './types';

export const TRAVELLER_OPTIONS = [
  { value: 'solo', label: 'Solo' },
  { value: 'couple', label: 'Couple' },
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' },
] as const satisfies readonly { value: Travellers; label: string }[];

export const PACE_OPTIONS = [
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'packed', label: 'Packed' },
] as const satisfies readonly { value: Pace; label: string }[];

export const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget' },
  { value: 'mid', label: 'Mid-range' },
  { value: 'luxury', label: 'Luxury' },
] as const satisfies readonly { value: BudgetLevel; label: string }[];

export const INTEREST_OPTIONS = [
  { value: 'culture', label: 'Culture' },
  { value: 'history', label: 'History' },
  { value: 'food', label: 'Food' },
  { value: 'nature', label: 'Nature' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'beaches', label: 'Beaches' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'art', label: 'Art' },
  { value: 'relaxation', label: 'Relaxation' },
] as const satisfies readonly { value: Interest; label: string }[];

export const MAX_DAYS = 10;
export const MAX_INTERESTS = 6;

/** The place the form plans for, carried in its address (from a destination page or My Trips). */
export function planPlaceQuery(place: PlanPlace): string {
  const params = new URLSearchParams({
    name: place.name,
    area: place.area,
    country: place.country,
    lat: String(place.lat),
    lon: String(place.lon),
  });
  if (place.placeId) params.set('placeId', place.placeId);
  return params.toString();
}

export function readPlanPlace(params: URLSearchParams): PlanPlace | null {
  const name = (params.get('name') ?? '').trim();
  const country = (params.get('country') ?? '').trim();
  const lat = Number(params.get('lat'));
  const lon = Number(params.get('lon'));
  if (!name || !country || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return {
    placeId: params.get('placeId')?.trim() ? params.get('placeId') : null,
    name,
    area: (params.get('area') ?? '').trim(),
    country,
    lat,
    lon,
  };
}

/** Guests and rooms for the Stays shortcut, from who is travelling. */
const PARTY: Record<Travellers, { guests: number; rooms: number }> = {
  solo: { guests: 1, rooms: 1 },
  couple: { guests: 2, rooms: 1 },
  family: { guests: 4, rooms: 1 },
  friends: { guests: 4, rooms: 2 },
};

/** Check-out (or drop-off): the last day, or the day after for a one-day plan. */
function leaveDate(plan: Plan): string {
  if (plan.days > 1) return plan.endDate;
  const [year = 1970, month = 1, day = 1] = plan.startDate.split('-').map(Number);
  return toIsoDate(addDays(new Date(year, month - 1, day), 1));
}

/** Book (4.3) pages for the plan's place and dates. */
export function bookingShortcuts(plan: Plan): { flights: string; stays: string; cars: string } {
  const party = PARTY[plan.travellers];
  const leave = leaveDate(plan);
  const flights = new URLSearchParams({ depart: plan.startDate, return: plan.endDate });
  if (plan.airport) {
    flights.set('to', plan.airport);
    flights.set('toName', plan.place.name);
  }
  return {
    flights: `${routes.flights}?${flights.toString()}`,
    stays: `${routes.stayResults}?${stayQuery({
      place: plan.place.name,
      checkin: plan.startDate,
      checkout: leave,
      adults: party.guests,
      rooms: party.rooms,
    })}`,
    cars: `${routes.rentalResults}?${carQuery({
      place: plan.place.name,
      airport: '',
      pickup: plan.startDate,
      dropoff: leave,
    })}`,
  };
}
