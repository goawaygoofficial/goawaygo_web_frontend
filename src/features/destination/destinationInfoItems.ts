import type { DestinationInfoItem } from './types';

/** The nine info cards, verbatim from `app_frontend/.../06_destinationInfo/utils/info_items.dart`. */
export function getDestinationInfoItems(place: string): DestinationInfoItem[] {
  return [
    {
      id: 'quick-facts',
      icon: 'language',
      title: 'Quick Facts',
      subtitle: `A brief overview of ${place}.`,
    },
    {
      id: 'visa',
      icon: 'gavel',
      title: 'Visa & Travel Restrictions',
      subtitle: 'Find out if you need a visa and what travel rules apply.',
    },
    {
      id: 'seasons',
      icon: 'calendar_month',
      title: 'Peak vs. Off-Peak Seasons',
      subtitle: 'Learn about the best and least crowded times to visit.',
    },
    {
      id: 'attractions',
      icon: 'place',
      title: 'Must-Visit Attractions & Activities',
      subtitle: 'Explore top landmarks, tours, and unique local experiences.',
    },
    {
      id: 'hotels',
      icon: 'hotel',
      title: 'Best Hotels and Resorts',
      subtitle: 'Browse the best places to stay across different budgets.',
    },
    {
      id: 'cuisine',
      icon: 'restaurant',
      title: 'Local Cuisine & Dining',
      subtitle: 'Discover must-try dishes, restaurants, and street food.',
    },
    {
      id: 'transport',
      icon: 'directions_bus',
      title: 'Local Transport Options',
      subtitle: 'How to get around — from public transit to taxis and more.',
    },
    {
      id: 'insurance',
      icon: 'health_and_safety',
      title: 'Travel Insurance',
      subtitle: 'Learn why and what kind of insurance you might need.',
    },
    {
      id: 'currency',
      icon: 'attach_money',
      title: 'Communication & Currency',
      subtitle: 'Stay connected and manage your money with ease.',
    },
  ];
}
