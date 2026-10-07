import type { TripType } from '@/types/search';

export interface FlightSearchRequest {
  from: string;
  to: string;
  tripType: TripType;
  /** `YYYY-MM-DD` */
  departureDate: string;
  /** `YYYY-MM-DD`; empty for one-way trips. */
  returnDate: string;
  adults: number;
  children: number;
}
