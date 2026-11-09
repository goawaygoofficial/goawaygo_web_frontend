/** Shapes of the backend's Discover API (`/api/discover/*`, `/api/me/saved-places`); see backend docs/destination-prompts.md. */

export type PlaceType = 'country' | 'region' | 'city' | 'place';

/** A real place found by the place search (Geoapify). */
export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
  /** "Jaipur, Rajasthan, India" */
  label: string;
}

export type CardId =
  | 'quickFacts'
  | 'visa'
  | 'seasons'
  | 'attractions'
  | 'hotels'
  | 'cuisine'
  | 'transport'
  | 'insurance'
  | 'currency';

export interface CardItem {
  label: string;
  detail: string;
  /** Prices, rates, dates, opening hours…: shown with "may vary". */
  mayChange: boolean;
  /** An official https link the backend checked, or null. */
  link: string | null;
}

export interface InfoCard {
  id: CardId;
  /** False: nothing passed the checks; shown as "Not available right now". */
  available: boolean;
  items: CardItem[];
}

/** A photo and its required credit (Wikimedia Commons or Unsplash). */
export interface Photo {
  url: string;
  credit: string;
  creditUrl: string;
  source: 'wikimedia' | 'unsplash';
}

export interface Spot {
  name: string;
  photo: Photo;
}

/**
 * `ok`: cards and photos. `busy`: the AI couldn't answer right now (photos still shown).
 * `unknown`: the AI doesn't know this place.
 */
export type DestinationStatus = 'ok' | 'busy' | 'unknown';

export interface DestinationPage {
  place: Place;
  status: DestinationStatus;
  cards: InfoCard[];
  spots: Spot[];
}

/** One slide of the home banner: a searched place and a photo of its top spot. */
export interface BannerSlide {
  place: Place;
  spot: string;
  photo: Photo | null;
}

/** A searched place kept on this device for signed-out visitors (the account keeps it for signed-in users). */
export interface RecentSearch {
  place: Place;
  /** The place's top spot when it was searched; its photo is looked up live. */
  spot: string;
  /** When it was opened (ISO); absent for places remembered before Recently viewed existed. */
  viewedAt?: string;
}

/** "Ideas for your next trip": a real place the backend confirmed on Wikipedia. */
export interface TripIdea {
  /** Stable for the same place ("hallstatt|austria"); the saved-place key. */
  id: string;
  name: string;
  area: string;
  country: string;
  category: string;
  kind: 'popular' | 'hidden gem';
  summary: string;
  lat: number;
  lon: number;
  photo: Photo;
}

/** A place in My Trips. */
export interface SavedPlace {
  id: number;
  key: string;
  name: string;
  area: string | null;
  country: string;
  lat: number;
  lon: number;
  category: string | null;
  savedAt: string;
}
