import type { Airport } from '@/features/book';
import type { TripType } from '@/types/search';

export interface FlightSearchRequest {
  /** What is typed in From; `from` is set once a suggestion is picked. */
  fromText: string;
  from: Airport | null;
  toText: string;
  to: Airport | null;
  tripType: TripType;
  /** `YYYY-MM-DD` */
  departureDate: string;
  /** `YYYY-MM-DD`; empty for one-way trips. */
  returnDate: string;
  /** 1-9; prices are per passenger. */
  passengers: number;
}
