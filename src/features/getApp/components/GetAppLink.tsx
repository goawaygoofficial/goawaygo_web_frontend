import { Link } from 'react-router-dom';
import { Icon } from '@/components';
import { routes } from '@/lib/routes';
import styles from './GetAppLink.module.css';
import { t } from '@/lib/i18n';

/** "Get the Android app" → /download. Used on Home and the sign-in page. */
export function GetAppLink({ className }: { className?: string }) {
  return (
    <Link to={routes.download} className={[styles.link, className].filter(Boolean).join(' ')}>
      <Icon name="android" className={styles.icon} />
      {t('Get the Android app')}
    </Link>
  );
}
