import { Link } from 'react-router-dom';
import { routes } from '@/lib/routes';
import { Icon } from '../Icon/Icon';
import styles from './NotificationButton.module.css';
import { t } from '@/lib/i18n';

/** The bell in Home's header: opens the notifications, with a badge for the unread ones. */
export function NotificationButton({ unread = 0 }: { unread?: number }) {
  const label = unread > 0 ? t('Notifications, {0} unread', String(unread)) : t('Notifications');
  return (
    <Link
      to={routes.notifications}
      className={styles.bell}
      aria-label={label}
      title={t('Notifications')}
    >
      <Icon name="notifications" />
      {unread > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}
