import { Button, Logo, PageShell } from '@/components';
import styles from './CrashFallback.module.css';

/** Shown instead of a blank page if rendering fails. The error itself has already gone to Sentry. */
export function CrashFallback() {
  return (
    <PageShell className={styles.page}>
      <Logo size="lg" />
      <h1 className={styles.title}>Something went wrong</h1>
      <p className={styles.text}>Sorry about that. We've been notified. Please reload the page.</p>
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        Reload
      </Button>
    </PageShell>
  );
}
