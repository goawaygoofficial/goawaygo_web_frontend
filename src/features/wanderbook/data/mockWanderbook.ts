import type { WanderPost, WanderbookProfile } from '../types';

/**
 * MOCK data — the Flutter app hardcodes this header (name, location, stats, bio) and renders the
 * post grid as six blank orange boxes. There is no Wanderbook API yet; replace with service calls.
 */
export const MOCK_WANDERBOOK_PROFILE: WanderbookProfile = {
  name: 'SIKANDAR RAJAJI',
  location: 'IBIZA, SPAIN',
  bio: ['🌍 Living for the thrill of new places', '🎯 Culture | Adventure | Stories'],
  stats: { posts: '212', followers: '14.2K', following: '88' },
};

export const MOCK_MY_POSTS: readonly WanderPost[] = [
  { id: 'm1', location: 'Ibiza, Spain', caption: 'Golden hour at Café del Mar.' },
  { id: 'm2', location: 'Lisbon, Portugal', caption: 'Tram 28 and pastéis de nata.' },
  { id: 'm3', location: 'Amalfi, Italy', caption: 'Lemon groves above the sea.' },
  { id: 'm4', location: 'Chefchaouen, Morocco', caption: 'Lost in the blue streets.' },
  { id: 'm5', location: 'Cappadocia, Turkey', caption: 'Up before sunrise for the balloons.' },
  { id: 'm6', location: 'Hallstatt, Austria', caption: 'A postcard come to life.' },
];

export const MOCK_FEED_POSTS: readonly WanderPost[] = [
  { id: 'f1', location: 'Queenstown, New Zealand', caption: 'Bungee first, coffee second.' },
  { id: 'f2', location: 'Hoi An, Vietnam', caption: 'Lantern night on the river.' },
  { id: 'f3', location: 'Banff, Canada', caption: 'Lake Moraine is unreal.' },
  { id: 'f4', location: 'Cusco, Peru', caption: 'Acclimatising before the Inca Trail.' },
  { id: 'f5', location: 'Zanzibar, Tanzania', caption: 'Spice tour and a dhow sunset.' },
  { id: 'f6', location: 'Edinburgh, Scotland', caption: 'Arthur’s Seat in the drizzle.' },
];
