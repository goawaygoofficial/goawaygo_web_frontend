import { useCallback, useEffect, useState } from 'react';
import { env } from '@/lib/env';
import { loadGoogleOAuth2 } from '@/lib/googleIdentity';
import type { GoogleAccountsOAuth2 } from '@/types/google-identity';
import { t } from '@/lib/i18n';

const GENERIC_FAILURE = 'Google could not confirm it was you. Please try again.';

/**
 * A one-time Google code for "confirm it's you" (accounts without a password): the backend exchanges it and checks
 * it is the account's own Google login. `requestCode` must run straight from a click (browsers block the popup
 * otherwise); it resolves `null` when the user closes the popup.
 */
export function useGoogleCode(): { ready: boolean; requestCode: () => Promise<string | null> } {
  const [oauth2, setOauth2] = useState<GoogleAccountsOAuth2 | null>(null);

  // Loaded ahead of time: the popup must open synchronously inside the click.
  useEffect(() => {
    if (env.googleClientId.length === 0) return;
    let cancelled = false;
    loadGoogleOAuth2().then(
      (loaded) => {
        if (!cancelled) setOauth2(loaded);
      },
      () => {
        // Stays not ready; the form says Google is unavailable.
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const requestCode = useCallback(
    () =>
      new Promise<string | null>((resolve, reject) => {
        if (!oauth2) {
          reject(new Error(t('Google is unavailable right now. Please try again later.')));
          return;
        }
        const state = crypto.randomUUID();
        oauth2
          .initCodeClient({
            client_id: env.googleClientId,
            scope: 'openid email profile',
            ux_mode: 'popup',
            select_account: true,
            state,
            callback: (response) => {
              if (response.error === 'access_denied') resolve(null);
              else if (!response.code || response.error || response.state !== state) {
                reject(new Error(GENERIC_FAILURE));
              } else resolve(response.code);
            },
            error_callback: (error) => {
              if (error.type === 'popup_failed_to_open') {
                reject(
                  new Error(
                    t(
                      'Your browser blocked the Google window. Please allow pop-ups for this site and try again.',
                    ),
                  ),
                );
              } else resolve(null);
            },
          })
          .requestCode();
      }),
    [oauth2],
  );

  return { ready: oauth2 !== null, requestCode };
}
