import type { GoogleAccountsId } from '@/types/google-identity';

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let loading: Promise<GoogleAccountsId> | null = null;

/** Loads the Google Identity Services script once and resolves with `google.accounts.id`. */
export function loadGoogleIdentity(): Promise<GoogleAccountsId> {
  if (window.google) return Promise.resolve(window.google.accounts.id);
  loading ??= new Promise<GoogleAccountsId>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) resolve(window.google.accounts.id);
      else reject(new Error('Google Sign-In failed to initialise.'));
    };
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error('Could not load Google Sign-In.'));
    };
    document.head.append(script);
  });
  return loading;
}
