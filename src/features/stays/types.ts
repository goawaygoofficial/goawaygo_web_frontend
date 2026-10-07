export interface StaySearchRequest {
  destination: string;
  /** `YYYY-MM-DD` */
  checkIn: string;
  /** `YYYY-MM-DD` */
  checkOut: string;
  rooms: number;
  adults: number;
}
