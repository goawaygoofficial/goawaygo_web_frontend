import { Link } from 'react-router-dom';
import { analyticsAvailable, reviewConsent } from '@/lib/analytics';
import { routes } from '@/lib/routes';
import styles from './LegalLinks.module.css';
import { t } from '@/lib/i18n';

/**
 * "Privacy · Terms · Delete my data · Privacy choices": the footer of Home, the sign-in page, Profile and Download.
 * "Privacy choices" reopens the analytics consent banner.
 */
export function LegalLinks({ className }: { className?: string }) {
  return (
    <nav aria-label={t('Legal')} className={[styles.links, className].filter(Boolean).join(' ')}>
      <Link to={routes.privacy}>{t('Privacy Policy')}</Link>
      <Link to={routes.terms}>{t('Terms of Use')}</Link>
      <Link to={routes.communityGuidelines}>{t('Community Guidelines')}</Link>
      <Link to={routes.deleteMyData}>{t('Delete my data')}</Link>
      {analyticsAvailable && (
        <button type="button" className={styles.choices} onClick={reviewConsent}>
          {t('Privacy choices')}
        </button>
      )}
    </nav>
  );
}

/**
 * Shown where an account is created (sign-in panel, Register). The links open in a new tab so a half-filled form
 * isn't lost.
 */
export function SignUpNotice({ className }: { className?: string }) {
  return (
    <p className={[styles.notice, className].filter(Boolean).join(' ')}>
      {t('By continuing, you agree to our')}{' '}
      <a href={routes.terms} target="_blank" rel="noreferrer">
        {t('Terms of Use')}
      </a>{' '}
      {t('and confirm you have read our')}{' '}
      <a href={routes.privacy} target="_blank" rel="noreferrer">
        {t('Privacy Policy')}
      </a>
      {t('. You must be 18 or older.')}
    </p>
  );
}
