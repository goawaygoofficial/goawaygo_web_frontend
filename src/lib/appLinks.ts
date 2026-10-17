/**
 * Where people get the Android app. Public URLs. Before launch: a direct APK download (Cloudflare R2, published by
 * app_frontend/scripts/release-android.sh) and a beta sign-up (Firebase App Distribution invite link). At launch,
 * set `playStoreUrl`; the download page then shows only the Play Store.
 */
interface AppLinks {
  readonly androidManifestUrl: string;
  readonly androidBetaUrl: string;
  readonly playStoreUrl: string;
}

// Typed as plain strings: empty values are switched on later without touching the pages.
export const appLinks: AppLinks = {
  /** Release manifest written next to the APKs (version, size, SHA-256 and URL of each file). */
  androidManifestUrl: 'https://downloads.goawaygo.com/android/latest.json',
  /** Firebase App Distribution invite link. Empty hides "Join the beta". */
  androidBetaUrl: 'https://appdistribution.firebase.dev/i/11e069c8b2ebcd3d',
  /** Google Play listing. Empty until launch. */
  playStoreUrl: '',
};
