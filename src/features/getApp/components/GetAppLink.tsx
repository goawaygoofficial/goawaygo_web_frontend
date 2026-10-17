import { Link } from 'react-router-dom';
import { Icon } from '@/components';
import { routes } from '@/lib/routes';
import styles from './GetAppLink.module.css';

/** "Get the Android app" → /download. Used on Home and the sign-in page. */
export function GetAppLink({ className }: { className?: string }) {
  return (
    <Link to={routes.download} className={[styles.link, className].filter(Boolean).join(' ')}>
      <Icon name="android" className={styles.icon} />
      Get the Android app
    </Link>
  );
}
