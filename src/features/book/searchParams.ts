import type { CarSearch, FlightSearch, StaySearch } from './types';

/**
 * Searches live in the results page's address, so Back, reload and sharing a results page all work.
 * Readers return null when something required is missing (the page then goes back to the form).
 */

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const IATA = /^[A-Z]{3}$/;

function count(value: string | null, min: number, max: number, fallback: number): number {
  const number = Number(value);
  return Number.isInteger(number) && number >= min && number <= max ? number : fallback;
}

export function flightQuery(search: FlightSearch): string {
  const params = new URLSearchParams({
    from: search.from,
    fromName: search.fromName,
    to: search.to,
    toName: search.toName,
    depart: search.depart,
    adults: String(search.adults),
  });
  if (search.returnDate) params.set('return', search.returnDate);
  return params.toString();
}

export function readFlightQuery(params: URLSearchParams): FlightSearch | null {
  const from = params.get('from') ?? '';
  const to = params.get('to') ?? '';
  const depart = params.get('depart') ?? '';
  const returnDate = params.get('return') ?? '';
  if (!IATA.test(from) || !IATA.test(to) || !DATE.test(depart)) return null;
  if (returnDate && !DATE.test(returnDate)) return null;
  return {
    from,
    fromName: params.get('fromName') ?? from,
    to,
    toName: params.get('toName') ?? to,
    depart,
    returnDate,
    adults: count(params.get('adults'), 1, 9, 1),
  };
}

export function stayQuery(search: StaySearch): string {
  return new URLSearchParams({
    place: search.place,
    checkin: search.checkin,
    checkout: search.checkout,
    adults: String(search.adults),
    rooms: String(search.rooms),
  }).toString();
}

export function readStayQuery(params: URLSearchParams): StaySearch | null {
  const place = (params.get('place') ?? '').trim();
  const checkin = params.get('checkin') ?? '';
  const checkout = params.get('checkout') ?? '';
  if (place.length < 2 || !DATE.test(checkin) || !DATE.test(checkout)) return null;
  return {
    place,
    checkin,
    checkout,
    adults: count(params.get('adults'), 1, 30, 2),
    rooms: count(params.get('rooms'), 1, 8, 1),
  };
}

export function carQuery(search: CarSearch): string {
  const params = new URLSearchParams({
    place: search.place,
    pickup: search.pickup,
    dropoff: search.dropoff,
  });
  if (search.airport) params.set('airport', search.airport);
  return params.toString();
}

export function readCarQuery(params: URLSearchParams): CarSearch | null {
  const place = (params.get('place') ?? '').trim();
  const pickup = params.get('pickup') ?? '';
  const dropoff = params.get('dropoff') ?? '';
  const airport = params.get('airport') ?? '';
  if (place.length < 2 || !DATE.test(pickup) || !DATE.test(dropoff)) return null;
  return { place, airport: IATA.test(airport) ? airport : '', pickup, dropoff };
}
