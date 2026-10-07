/**
 * Typed, validated access to build-time environment variables.
 * Missing values never throw — features that need them degrade gracefully instead.
 */
function read(value: string | undefined): string {
  return (value ?? '').trim();
}

export const env = {
  /** Backend origin without a trailing slash. Empty means "same origin". */
  apiBaseUrl: read(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, ''),
  /** Google OAuth web client ID. Empty hides Google sign-in. */
  googleClientId: read(import.meta.env.VITE_GOOGLE_CLIENT_ID),
} as const;
