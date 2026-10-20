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
  profile: '/profile',
  profileDetails: '/profile/details',
  /** Register / Forgot Password opened from the Profile tab's sign-in panel. */
  profileRegister: '/profile/register',
  profileForgotPassword: '/profile/forgot-password',
  flights: '/flights',
  stays: '/stays',
  rentals: '/rentals',
  destinationPattern: '/destination/:place',
  destination: (place: string) => `/destination/${encodeURIComponent(place)}`,
} as const;
