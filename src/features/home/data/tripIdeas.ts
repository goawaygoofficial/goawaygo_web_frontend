import type { TripIdea } from '../types';

/**
 * PLACEHOLDER content — the Flutter app's carousel shows blank coloured cards ("Card 1…5") and there is
 * no trip-ideas endpoint yet. Swap this for a service call returning `TripIdea[]` when one exists.
 */
export const PLACEHOLDER_TRIP_IDEAS: readonly TripIdea[] = [
  {
    id: 'santorini',
    title: 'Island sunsets',
    destination: 'Santorini',
    country: 'Greece',
    tagline: 'Whitewashed villages and caldera views.',
    tone: 'sunset',
  },
  {
    id: 'kyoto',
    title: 'Temples & blossoms',
    destination: 'Kyoto',
    country: 'Japan',
    tagline: 'Spring walks through a thousand shrines.',
    tone: 'ember',
  },
  {
    id: 'marrakech',
    title: 'Souks and spice',
    destination: 'Marrakech',
    country: 'Morocco',
    tagline: 'Rooftop dinners above the medina.',
    tone: 'coral',
  },
  {
    id: 'reykjavik',
    title: 'Northern lights',
    destination: 'Reykjavik',
    country: 'Iceland',
    tagline: 'Hot springs by day, aurora by night.',
    tone: 'peach',
  },
  {
    id: 'bali',
    title: 'Rice terraces',
    destination: 'Bali',
    country: 'Indonesia',
    tagline: 'Jungle retreats and surf at sunrise.',
    tone: 'sunset',
  },
];
