/** A city or airport to fly from or to (a city code covers all its airports). */
export interface Airport {
  /** IATA code, e.g. `DEL` */
  code: string;
  type: 'city' | 'airport';
  name: string;
  /** The airport's city; empty for a city. */
  city: string;
  country: string;
  countryCode: string;
}

/** One fare as Aviasales last saw it (a recent price, not a live one). */
export interface Fare {
  origin: string;
  destination: string;
  /** IATA airline code, e.g. `6E` */
  airline: string;
  airlineName: string;
  flightNumber: string | null;
  /** Departure in the airport's local time, ISO 8601 with offset. */
  departAt: string;
  returnAt: string | null;
  stops: number;
  returnStops: number | null;
  durationMinutes: number | null;
  /** Per adult, in {@link FlightResults.currency}. */
  price: number;
  /** Our affiliate link to this fare on Aviasales. */
  link: string;
}

export interface FlightResults {
  priceKind: 'recent';
  currency: string;
  /** The cheapest fares on the dates asked (often one, sometimes none). */
  onDate: Fare[];
  /** The cheapest fares on other dates of the same month, cheapest first. */
  nearby: Fare[];
  /** Aviasales' live search for exactly this trip. */
  searchLink: string;
}

export interface FlightSearch {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  /** `YYYY-MM-DD` */
  depart: string;
  /** `YYYY-MM-DD`, empty for one way. */
  returnDate: string;
  adults: number;
}

/** A partner card: opens the partner's own search with the traveller's place and dates. */
export interface PartnerCard {
  id: string;
  name: string;
  link: string;
}

export interface StaySearch {
  place: string;
  checkin: string;
  checkout: string;
  adults: number;
  rooms: number;
}

export interface CarSearch {
  place: string;
  /** IATA code when an airport was picked; empty otherwise. */
  airport: string;
  pickup: string;
  dropoff: string;
}
