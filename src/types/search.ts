/** One-way vs round-trip choice shared by Flights and Rentals. */
export type TripType = 'oneWay' | 'roundTrip';

export const TRIP_TYPE_OPTIONS = [
  { value: 'oneWay', label: 'One Way' },
  { value: 'roundTrip', label: 'Round Trip' },
] as const satisfies readonly { value: TripType; label: string }[];
