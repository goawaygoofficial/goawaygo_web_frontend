/** Visual treatment of a trip-idea card; each maps to a brand gradient. */
export type TripIdeaTone = 'sunset' | 'ember' | 'coral' | 'peach';

/** A suggested trip shown in the Home carousel. Shape is ready for real data from the backend. */
export interface TripIdea {
  id: string;
  title: string;
  /** Place passed to the destination info page when the card is opened. */
  destination: string;
  country: string;
  tagline: string;
  tone: TripIdeaTone;
}
