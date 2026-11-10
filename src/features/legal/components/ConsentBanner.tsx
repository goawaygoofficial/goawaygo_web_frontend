import { useSyncExternalStore } from 'react';
import { Button } from '@/components';
import {
  analyticsAvailable,
  getConsent,
  isReviewingConsent,
  setConsent,
  subscribeConsent,
} from '@/lib/analytics';
import { routes } from '@/lib/routes';
import styles from './ConsentBanner.module.css';
import { t } from '@/lib/i18n';

/**
 * Asks once whether we may collect anonymous usage statistics, with "Allow" and "No thanks" equally easy. Shown
 * again from "Privacy choices". Nothing is collected until the visitor allows it.
 */
export function ConsentBanner() {
  const consent = useSyncExternalStore(subscribeConsent, getConsent);
  const reviewing = useSyncExternalStore(subscribeConsent, isReviewingConsent);

  if (!analyticsAvailable || (consent !== null && !reviewing)) return null;

  return (
    <section className={styles.banner} aria-labelledby="consent-title" aria-live="polite">
      <h2 id="consent-title" className={styles.title}>
        {t('Help us improve GoAwayGo?')}
      </h2>
      <p className={styles.text}>
        {t(
          'With your permission we collect anonymous usage statistics (which pages and features are used) with PostHog. No ads, no tracking across other sites, and you can change your mind any time under “Privacy choices”.',
        )}{' '}
        <a href={`${routes.privacy}#cookies`}>{t('Learn more')}</a>
      </p>
      {reviewing && consent !== null && (
        <p className={styles.current}>
          {consent === 'granted' ? t('Currently: allowed.') : t('Currently: not allowed.')}
        </p>
      )}
      <div className={styles.actions}>
        <Button
          variant="light"
          className={styles.choice}
          onClick={() => {
            setConsent('denied');
          }}
        >
          {t('No thanks')}
        </Button>
        <Button
          variant="light"
          className={styles.choice}
          onClick={() => {
            setConsent('granted');
          }}
        >
          {t('Allow')}
        </Button>
      </div>
    </section>
  );
}
