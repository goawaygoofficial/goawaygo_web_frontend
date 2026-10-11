import { Button } from '@/components';
import { useAsyncAction } from '@/hooks';
import { useUser } from '@/providers';
import { useResendVerification } from '../hooks/useResendVerification';
import styles from './VerifyEmailBanner.module.css';

/** Asks a signed-in user with an unverified email to open the link we emailed, with a way to get a new one. */
export function VerifyEmailBanner() {
  const { user } = useUser();
  const [pending, run] = useAsyncAction(useResendVerification());

  if (!user || user.emailVerified) return null;

  return (
    <section className={styles.banner} aria-label="Verify your email">
      <p className={styles.text}>
        <strong>Please verify your email</strong>
        Open the link we sent to <span className={styles.email}>{user.email}</span>.
      </p>
      <Button variant="linkAccent" loading={pending} onClick={run}>
        Resend link
      </Button>
    </section>
  );
}
