import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { toErrorMessage } from '@/lib/apiClient';
import { AuthOverlay } from '../components/AuthOverlay';
import { useLinkToken } from '../hooks/useLinkToken';
import { confirmEmailChange } from '../services/authService';
import styles from '../components/AuthForms.module.css';

type ConfirmState =
  { kind: 'confirming' } | { kind: 'confirmed' } | { kind: 'failed'; message: string };

const INCOMPLETE_LINK_MESSAGE =
  'This link is incomplete. Please open the link from the email again.';

/** One request per token: it is single-use (see VerifyEmailPage). */
const confirmations = new Map<string, Promise<void>>();

function confirmOnce(token: string): Promise<void> {
  let pending = confirmations.get(token);
  if (!pending) {
    pending = confirmEmailChange(token);
    confirmations.set(token, pending);
  }
  return pending;
}

/** Opened from the "Confirm your new email" email: `/confirm-email?token=…`. Confirms as soon as it opens. */
export function ConfirmEmailPage() {
  const token = useLinkToken();
  const [state, setState] = useState<ConfirmState>(() =>
    token ? { kind: 'confirming' } : { kind: 'failed', message: INCOMPLETE_LINK_MESSAGE },
  );
  const { user, reloadUser } = useUser();

  useEffect(() => {
    if (!token) return;
    let active = true;
    confirmOnce(token)
      .then(() => {
        if (active) setState({ kind: 'confirmed' });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            kind: 'failed',
            message: toErrorMessage(error, 'Could not confirm your new email.'),
          });
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  // Signed in here: show the new email straight away.
  useEffect(() => {
    if (state.kind === 'confirmed') reloadUser().catch(() => undefined);
  }, [state.kind, reloadUser]);

  const next = user ? routes.profileDetails : routes.auth;
  return (
    <AuthOverlay>
      {state.kind === 'confirming' && (
        <>
          <h1 className={styles.heading}>Confirming your new email…</h1>
          <span className={styles.spinner} role="status" aria-label="Confirming" />
        </>
      )}
      {state.kind === 'confirmed' && (
        <>
          <h1 className={styles.heading}>Email Changed</h1>
          <p className={styles.message}>
            Your account now uses this address. Sign in with it from now on.
          </p>
          <Link to={next} className={styles.accentLink}>
            {user ? 'Back to User Profile' : 'Sign in'}
          </Link>
        </>
      )}
      {state.kind === 'failed' && (
        <>
          <h1 className={styles.heading}>Link Not Valid</h1>
          <p className={styles.message}>{state.message}</p>
          <Link to={next} className={styles.accentLink}>
            {user ? 'Back to User Profile' : 'Back to Sign In'}
          </Link>
        </>
      )}
    </AuthOverlay>
  );
}
