export type Travellers = 'solo' | 'couple' | 'family' | 'friends';
export type Pace = 'relaxed' | 'balanced' | 'packed';
export type BudgetLevel = 'budget' | 'mid' | 'luxury';
export type Interest =
  | 'culture'
  | 'history'
  | 'food'
  | 'nature'
  | 'adventure'
  | 'beaches'
  | 'nightlife'
  | 'shopping'
  | 'art'
  | 'relaxation';

/** Where a plan is for: a destination page's place or a place saved in My Trips. */
export interface PlanPlace {
  placeId: string | null;
  name: string;
  area: string;
  country: string;
  lat: number;
  lon: number;
}

export interface PlanRequest {
  place: PlanPlace;
  /** `YYYY-MM-DD` */
  startDate: string;
  days: number;
  travellers: Travellers;
  pace: Pace;
  budget: BudgetLevel;
  interests: Interest[];
}

/** One part of a day: where, what to do and its rough cost (whole group). */
export interface Slot {
  place: string;
  activity: string;
  cost: number;
}

export interface DayPlan {
  day: number;
  /** `YYYY-MM-DD` */
  date: string;
  title: string;
  morning: Slot;
  afternoon: Slot;
  evening: Slot;
  food: string[];
  tip: string;
  /** The day's food, local transport and activities, whole group. */
  cost: number;
}

/** Rough costs for the whole group; flights never included. */
export interface Estimate {
  perDay: number;
  stayPerNight: number;
  nights: number;
  total: number;
}

export interface Plan {
  id: string;
  /** The viewer made this plan (can change, share and delete it). */
  mine: boolean;
  shared: boolean;
  place: PlanPlace;
  /** The destination's city airport, for the Flights shortcut. */
  airport: string | null;
  startDate: string;
  endDate: string;
  days: number;
  travellers: Travellers;
  pace: Pace;
  budget: BudgetLevel;
  interests: Interest[];
  currency: string;
  title: string;
  summary: string;
  dayPlans: DayPlan[];
  tips: string[];
  estimate: Estimate;
}

/** A plan in My Trips. */
export interface PlanSummary {
  id: string;
  title: string;
  placeName: string;
  country: string;
  startDate: string;
  days: number;
  shared: boolean;
}
