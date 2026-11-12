import type { Place } from '@/features/discover';

/** "Confirm it's you": the current password, or the one-time code from Google's popup (accounts without one). */
export interface Proof {
  password?: string;
  googleCode?: string;
}

export interface Country {
  code: string;
  name: string;
  /** The country's currency (ISO 4217), or null (e.g. Antarctica). */
  currency: string | null;
}

export interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

export interface Regions {
  countries: Country[];
  currencies: CurrencyOption[];
}

export interface ViewedPlace {
  place: Place;
  viewedAt: string;
}

export interface ViewedPlan {
  id: string;
  title: string;
  placeName: string;
  country: string;
  startDate: string;
  days: number;
  /** The viewer's own plan; otherwise one shared with them by link. */
  mine: boolean;
  viewedAt: string;
}

export interface RecentlyViewed {
  places: ViewedPlace[];
  plans: ViewedPlan[];
}
