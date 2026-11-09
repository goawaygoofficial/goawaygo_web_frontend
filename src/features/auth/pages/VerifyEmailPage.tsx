import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components';
import { useAsyncAction } from '@/hooks';
import { toErrorMessage } from '@/lib/apiClient';
import { routes } from '@/lib/routes';
import { useUser } from '@/providers';
import { AuthOverlay } from '../components/AuthOverlay';
import { useLinkToken } from '../hooks/useLinkToken';
import { useResendVerification } from '../hooks/useResendVerification';
import { verifyEmail } from '../services/authService';
import styles from '../components/AuthForms.module.css';
import { t } from '@/lib/i18n';

type VerifyState =
  { kind: 'verifying' } | { kind: 'verified' } | { kind: 'failed'; message: string };

const INCOMPLETE_LINK_MESSAGE =
  'This verification link is incomplete. Please open the link from the email again.';

/**
 * One request per token for the lifetime of the page. The token is single-use, so a second request (React's
 * development double-render, or a remount) would fail and show an error for a link that just worked.
 */
const verifications = new Map<string, Promise<void>>();

function verifyOnce(token: string): Promise<void> {
  let pending = verifications.get(token);
  if (!pending) {
    pending = verifyEmail(token);
    verifications.set(token, pending);
  }
  return pending;
}

/** Opened from the "Verify your email" email: `/verify-email?token=…`. Verifies as soon as it opens. */
export function VerifyEmailPage() {
  const token = useLinkToken();
  const [state, setState] = useState<VerifyState>(() =>
    token ? { kind: 'verifying' } : { kind: 'failed', message: t(INCOMPLETE_LINK_MESSAGE) },
  );
  const { user, reloadUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    let active = true;
    verifyOnce(token)
      .then(() => {
        if (active) setState({ kind: 'verified' });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({ kind: 'failed', message: toErrorMessage(error, t('Failed to verify email')) });
        }
      });
    return () => {
      active = false;
    };
  }, [token]);

  // If this browser is signed in, show the account as verified straight away.
  useEffect(() => {
    if (state.kind === 'verified') reloadUser().catch(() => undefined);
  }, [state.kind, reloadUser]);

  return (
    <AuthOverlay>
      {state.kind === 'verifying' && (
        <>
          <h1 className={styles.heading}>{t('Verifying your email…')}</h1>
          <span className={styles.spinner} role="status" aria-label={t('Verifying')} />
        </>
      )}
      {state.kind === 'verified' && (
        <>
          <h1 className={styles.heading}>{t('Email Verified')}</h1>
          <p className={styles.message}>{t('Thanks! Your email address is confirmed.')}</p>
          <Button
            fullWidth
            onClick={() => {
              void navigate(user ? routes.home : routes.auth, { replace: true });
            }}
          >
            {user ? 'CONTINUE' : t('SIGN IN')}
          </Button>
        </>
      )}
      {state.kind === 'failed' && (
        <>
          <h1 className={styles.heading}>{t('Link Not Valid')}</h1>
          <p className={styles.message}>{state.message}</p>
          {user && !user.emailVerified ? (
            <ResendButton />
          ) : (
            <Link to={user ? routes.home : routes.auth} className={styles.accentLink}>
              {user ? t('Go to Home') : t('Back to Sign In')}
            </Link>
          )}
        </>
      )}
    </AuthOverlay>
  );
}

function ResendButton() {
  const [pending, run] = useAsyncAction(useResendVerification());
  return (
    <Button fullWidth loading={pending} onClick={run}>
      {t('SEND A NEW LINK')}
    </Button>
  );
}
