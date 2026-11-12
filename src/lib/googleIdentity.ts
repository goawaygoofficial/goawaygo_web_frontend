import type { GoogleAccountsOAuth2 } from '@/types/google-identity';
import { t } from '@/lib/i18n';

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let loading: Promise<GoogleAccountsOAuth2> | null = null;

/** Loads the Google Identity Services script once and resolves with `google.accounts.oauth2`. */
export function loadGoogleOAuth2(): Promise<GoogleAccountsOAuth2> {
  if (window.google) return Promise.resolve(window.google.accounts.oauth2);
  loading ??= new Promise<GoogleAccountsOAuth2>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) resolve(window.google.accounts.oauth2);
      else reject(new Error(t('Google Sign-In failed to initialise.')));
    };
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error(t('Could not load Google Sign-In.')));
    };
    document.head.append(script);
  });
  return loading;
}
