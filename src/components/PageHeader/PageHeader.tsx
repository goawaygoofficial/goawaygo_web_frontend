import type { ReactNode } from 'react';
import { Icon } from '../Icon/Icon';
import { Logo } from '../Logo/Logo';
import { NotificationButton } from '../NotificationButton/NotificationButton';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  /** Centre slot, e.g. a page title. */
  children?: ReactNode;
  /** Shows a back arrow on the right that calls this. */
  onBack?: () => void;
  backLabel?: string;
  /** Shows the notification bell on the right. Only Home has notifications. */
  showNotifications?: boolean;
  /** The bell's unread badge. */
  unreadNotifications?: number;
  /** Extra controls on the right, after the bell. */
  actions?: ReactNode;
}

/** Logo row used at the top of nearly every screen. */
export function PageHeader({
  children,
  onBack,
  backLabel = 'Back',
  showNotifications = false,
  unreadNotifications = 0,
  actions,
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <Logo size="md" />
      <div className={styles.centre}>{children}</div>
      <div className={styles.actions}>
        {showNotifications && <NotificationButton unread={unreadNotifications} />}
        {actions}
        {onBack && (
          <button type="button" className={styles.back} aria-label={backLabel} onClick={onBack}>
            <Icon name="arrow_back_ios_rounded" />
          </button>
        )}
      </div>
    </header>
  );
}
