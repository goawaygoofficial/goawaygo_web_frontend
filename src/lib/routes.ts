/** Every route in the app, 1:1 with the Flutter screens. Use these instead of string literals. */
export const routes = {
  splash: '/',
  auth: '/auth',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  /** Opened from emailed links (`?token=…`); the backend builds these URLs, so keep the paths in sync. */
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  /** Get the Android app: APK download, beta sign-up, later the Play Store. */
  download: '/download',
  /** Legal pages, also opened from the Android app (keep the paths in sync with app_frontend). */
  privacy: '/privacy',
  terms: '/terms',
  deleteMyData: '/delete-my-data',
  home: '/home',
  trips: '/trips',
  wanderbook: '/wanderbook',
  /** Wanderbook (4.2). Profiles and posts use the backend's random public ids. */
  wanderbookProfilePattern: '/wanderbook/u/:publicId',
  wanderbookProfile: (publicId: string) => `/wanderbook/u/${publicId}`,
  wanderbookPeoplePattern: '/wanderbook/u/:publicId/:list',
  wanderbookPeople: (publicId: string, list: 'followers' | 'following') =>
    `/wanderbook/u/${publicId}/${list}`,
  wanderbookPostPattern: '/wanderbook/p/:publicId',
  wanderbookPost: (publicId: string) => `/wanderbook/p/${publicId}`,
  wanderbookNewPost: '/wanderbook/new',
  wanderbookEditProfile: '/wanderbook/edit',
  wanderbookRequests: '/wanderbook/requests',
  wanderbookBlocked: '/wanderbook/blocked',
  /** Admins review Wanderbook reports here (the backend's report emails link to it). */
  adminReports: '/admin/reports',
  communityGuidelines: '/community-guidelines',
  profile: '/profile',
  profileDetails: '/profile/details',
  /** Register / Forgot Password opened from the Profile tab's sign-in panel. */
  profileRegister: '/profile/register',
  profileForgotPassword: '/profile/forgot-password',
  flights: '/flights',
  stays: '/stays',
  rentals: '/rentals',
  /** Book (4.3) results; the search is in the query (`features/book/searchParams.ts`). */
  flightResults: '/flights/results',
  stayResults: '/stays/results',
  rentalResults: '/rentals/results',
  destinationPattern: '/destination/:place',
  /**
   * A destination page. `id`: the place picked from the suggestions; `q`: what to search for when there is no id
   * (defaults to the name in the path).
   */
  destination: (place: string, search?: { id?: string; q?: string }) => {
    const params = new URLSearchParams();
    if (search?.id) params.set('id', search.id);
    if (search?.q) params.set('q', search.q);
    const query = params.toString();
    return `/destination/${encodeURIComponent(place)}${query ? `?${query}` : ''}`;
  },
} as const;
