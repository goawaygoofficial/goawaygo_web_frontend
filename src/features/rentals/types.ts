import type { TripType } from '@/types/search';

/** Exactly the options offered by the app's car-type dropdown. */
export const CAR_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Convertible', 'Van'] as const;

export type CarType = (typeof CAR_TYPES)[number];

export interface RentalSearchRequest {
  pickup: string;
  dropOff: string;
  tripType: TripType;
  /** `YYYY-MM-DD` */
  departureDate: string;
  /** `YYYY-MM-DD`; empty for one-way rentals. */
  returnDate: string;
  carType: CarType | '';
}
