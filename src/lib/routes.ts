/** Every route in the app, 1:1 with the Flutter screens. Use these instead of string literals. */
export const routes = {
  splash: '/',
  auth: '/auth',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  /** Opened from emailed links (`?token=…`); the backend builds these URLs, so keep the paths in sync. */
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  home: '/home',
  trips: '/trips',
  wanderbook: '/wanderbook',
  profile: '/profile',
  profileDetails: '/profile/details',
  flights: '/flights',
  stays: '/stays',
  rentals: '/rentals',
  destinationPattern: '/destination/:place',
  destination: (place: string) => `/destination/${encodeURIComponent(place)}`,
} as const;
