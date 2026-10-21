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
        Help us improve Goaway?
      </h2>
      <p className={styles.text}>
        With your permission we collect anonymous usage statistics (which pages and features are
        used) with PostHog. No ads, no tracking across other sites, and you can change your mind any
        time under “Privacy choices”. <a href={`${routes.privacy}#cookies`}>Learn more</a>
      </p>
      {reviewing && consent !== null && (
        <p className={styles.current}>
          Currently: {consent === 'granted' ? 'allowed' : 'not allowed'}.
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
          No thanks
        </Button>
        <Button
          variant="light"
          className={styles.choice}
          onClick={() => {
            setConsent('granted');
          }}
        >
          Allow
        </Button>
      </div>
    </section>
  );
}
