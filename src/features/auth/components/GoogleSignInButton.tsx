import { useCallback, useEffect, useRef, useState } from 'react';
import googleIcon from '@/assets/icons/google_icon.png';
import { Button } from '@/components';
import { useAsyncAction } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { env } from '@/lib/env';
import { loadGoogleOAuth2 } from '@/lib/googleIdentity';
import { useDialog } from '@/providers';
import type { GoogleAccountsOAuth2, GoogleCodeResponse } from '@/types/google-identity';
import { useCompleteSignIn } from '../hooks/useCompleteSignIn';
import { signInWithGoogleCode } from '../services/authService';
import styles from './GoogleSignInButton.module.css';

const GOOGLE_SCOPES = 'openid email profile';
const GENERIC_FAILURE = 'Google sign-in failed. Please try again.';

/**
 * "Continue with Google" in the app's own button style. Opens Google's popup with the OAuth 2.0 code client and
 * sends the one-time code to the backend, which exchanges it with Google (the client secret never reaches the
 * browser). Renders nothing when `VITE_GOOGLE_CLIENT_ID` is not configured.
 * After signing in it opens `redirectTo` (Home by default).
 */
export function GoogleSignInButton({ redirectTo }: { redirectTo?: string }) {
  if (env.googleClientId.length === 0) return null;
  return <GoogleButton clientId={env.googleClientId} redirectTo={redirectTo} />;
}

function GoogleButton({ clientId, redirectTo }: { clientId: string; redirectTo?: string }) {
  const [oauth2, setOauth2] = useState<GoogleAccountsOAuth2 | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  /** The `state` sent with the current request; Google must echo it back unchanged. */
  const expectedState = useRef<string | null>(null);
  const { showError } = useDialog();
  const completeSignIn = useCompleteSignIn(redirectTo);

  // Load Google's script ahead of time: the popup must open synchronously inside the click.
  useEffect(() => {
    let cancelled = false;
    loadGoogleOAuth2()
      .then((loaded) => {
        if (!cancelled) setOauth2(loaded);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const exchangeCode = useCallback(
    async (code: string) => {
      try {
        const result = await signInWithGoogleCode({ code });
        await completeSignIn(result, 'Welcome');
      } catch (error) {
        await showError(toErrorMessage(error, GENERIC_FAILURE));
      }
    },
    [completeSignIn, showError],
  );
  const [pending, runExchange] = useAsyncAction(exchangeCode);

  const handleResponse = (response: GoogleCodeResponse) => {
    const expected = expectedState.current;
    expectedState.current = null;
    if (response.error === 'access_denied') return; // The user cancelled on Google's consent screen.
    if (!response.code || response.error || response.state !== expected) {
      void showError(GENERIC_FAILURE);
      return;
    }
    runExchange(response.code);
  };

  const openGoogle = () => {
    if (!oauth2) return;
    const state = crypto.randomUUID();
    expectedState.current = state;
    oauth2
      .initCodeClient({
        client_id: clientId,
        scope: GOOGLE_SCOPES,
        ux_mode: 'popup',
        select_account: true,
        state,
        callback: handleResponse,
        error_callback: (error) => {
          expectedState.current = null;
          if (error.type === 'popup_failed_to_open') {
            void showError(
              'Your browser blocked the Google sign-in window. Please allow pop-ups for this site and try again.',
            );
          }
          // popup_closed: the user closed it on purpose; nothing to report.
        },
      })
      .requestCode();
  };

  if (loadFailed) {
    return (
      <p className={styles.unavailable} role="status">
        Google sign-in is unavailable right now.
      </p>
    );
  }

  return (
    <Button
      variant="google"
      fullWidth
      icon={<img src={googleIcon} alt="" />}
      loading={pending}
      disabled={oauth2 === null}
      onClick={openGoogle}
    >
      Continue with Google
    </Button>
  );
}
