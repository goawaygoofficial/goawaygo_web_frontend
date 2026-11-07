import type { Airport } from '@/features/book';

export interface RentalSearchRequest {
  /** What is typed in Pick-up; `pickup` is set once a suggestion is picked. */
  pickupText: string;
  pickup: Airport | null;
  /** `YYYY-MM-DD` */
  pickupDate: string;
  /** `YYYY-MM-DD` */
  dropOffDate: string;
}
