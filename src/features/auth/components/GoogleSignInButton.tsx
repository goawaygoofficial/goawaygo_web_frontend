import { useCallback, useEffect, useRef, useState } from 'react';
import { useAsyncAction } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { env } from '@/lib/env';
import { loadGoogleIdentity } from '@/lib/googleIdentity';
import { useDialog } from '@/providers';
import { useCompleteSignIn } from '../hooks/useCompleteSignIn';
import { signInWithGoogle } from '../services/authService';
import styles from './GoogleSignInButton.module.css';

/** Widest button Google Identity Services will render. */
const GOOGLE_BUTTON_MAX_WIDTH = 400;

/**
 * "Continue with Google" via Google Identity Services. The ID token it returns is posted to
 * `/api/auth/google-signin`. Renders nothing when `VITE_GOOGLE_CLIENT_ID` is not configured.
 */
export function GoogleSignInButton() {
  if (env.googleClientId.length === 0) return null;
  return <GoogleButton clientId={env.googleClientId} />;
}

function GoogleButton({ clientId }: { clientId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const { showError } = useDialog();
  const completeSignIn = useCompleteSignIn();

  const handleCredential = useCallback(
    async (idToken: string) => {
      try {
        const result = await signInWithGoogle({ idToken });
        await completeSignIn(result, 'Welcome');
      } catch (error) {
        await showError(toErrorMessage(error, 'Google Signin failed'));
      }
    },
    [completeSignIn, showError],
  );
  const [pending, run] = useAsyncAction(handleCredential);

  // GIS keeps the callback from `initialize`, so route it through a ref to always use the latest one.
  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  }, [run]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleIdentity()
      .then((googleId) => {
        const container = containerRef.current;
        if (cancelled || !container) return;
        googleId.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          callback: (response) => {
            runRef.current(response.credential);
          },
        });
        googleId.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'left',
          width: Math.min(container.clientWidth, GOOGLE_BUTTON_MAX_WIDTH),
        });
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (loadFailed) {
    return (
      <p className={styles.unavailable} role="status">
        Google sign-in is unavailable right now.
      </p>
    );
  }

  return (
    <div className={styles.wrapper} aria-busy={pending || undefined}>
      <div ref={containerRef} className={styles.button} />
      {pending && (
        <p className={styles.status} role="status">
          Signing you in…
        </p>
      )}
    </div>
  );
}
