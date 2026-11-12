import { Button, Logo, PageShell } from '@/components';
import styles from './CrashFallback.module.css';
import { t } from '@/lib/i18n';

/** Shown instead of a blank page if rendering fails. The error itself has already gone to Sentry. */
export function CrashFallback() {
  return (
    <PageShell className={styles.page}>
      <Logo size="lg" />
      <h1 className={styles.title}>{t('Something went wrong')}</h1>
      <p className={styles.text}>
        {t("Sorry about that. We've been notified. Please reload the page.")}
      </p>
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        {t('Reload')}
      </Button>
    </PageShell>
  );
}
