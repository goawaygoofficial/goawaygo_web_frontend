import type { CardId } from '@/features/discover';
import type { CardMeta } from './types';

/** The nine info cards, in page order (titles and subtitles decided for 4.1; the app uses the same). */
export const CARD_META: Record<CardId, CardMeta> = {
  quickFacts: {
    icon: 'language',
    title: 'Quick Facts',
    subtitle: "Country, languages, currency, time zone and what it's known for",
  },
  visa: {
    icon: 'gavel',
    title: 'Visa & Entry Rules',
    subtitle: 'Visa systems, passport validity and entry requirements',
  },
  seasons: {
    icon: 'calendar_month',
    title: 'Best Time to Visit',
    subtitle: 'Peak, off-peak and shoulder months, weather and big events',
  },
  attractions: {
    icon: 'place',
    title: 'Top Attractions',
    subtitle: 'Famous landmarks and experiences worth your time',
  },
  hotels: {
    icon: 'hotel',
    title: 'Best Areas to Stay',
    subtitle: 'Neighbourhoods to book in, and who each one suits',
  },
  cuisine: {
    icon: 'restaurant',
    title: 'Food & Dining',
    subtitle: 'Dishes to try and local dining customs',
  },
  transport: {
    icon: 'directions_bus',
    title: 'Getting Around',
    subtitle: 'From the airport and the main ways to travel locally',
  },
  insurance: {
    icon: 'health_and_safety',
    title: 'Travel Insurance',
    subtitle: "Whether it's required, medical care and local risks",
  },
  currency: {
    icon: 'attach_money',
    title: 'Money & Connectivity',
    subtitle: 'Currency, cards or cash, tipping, SIM/eSIM, plugs and emergency number',
  },
};
