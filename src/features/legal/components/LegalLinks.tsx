import { Link } from 'react-router-dom';
import { analyticsAvailable, reviewConsent } from '@/lib/analytics';
import { routes } from '@/lib/routes';
import styles from './LegalLinks.module.css';

/**
 * "Privacy · Terms · Delete my data · Privacy choices": the footer of Home, the sign-in page, Profile and Download.
 * "Privacy choices" reopens the analytics consent banner.
 */
export function LegalLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="Legal" className={[styles.links, className].filter(Boolean).join(' ')}>
      <Link to={routes.privacy}>Privacy Policy</Link>
      <Link to={routes.terms}>Terms of Use</Link>
      <Link to={routes.communityGuidelines}>Community Guidelines</Link>
      <Link to={routes.deleteMyData}>Delete my data</Link>
      {analyticsAvailable && (
        <button type="button" className={styles.choices} onClick={reviewConsent}>
          Privacy choices
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
      By continuing, you agree to our{' '}
      <a href={routes.terms} target="_blank" rel="noreferrer">
        Terms of Use
      </a>{' '}
      and confirm you have read our{' '}
      <a href={routes.privacy} target="_blank" rel="noreferrer">
        Privacy Policy
      </a>
      . You must be 18 or older.
    </p>
  );
}
